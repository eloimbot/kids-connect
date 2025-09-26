// server.js - Backend Node.js + Express + socket.io
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const { sshExec } = require('./ssh-utils');

const { Low, JSONFile } = require('lowdb');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// lowdb
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDB(){
  await db.read();
  db.data = db.data || { aps: [], clients: [], vlans: [], wlans: [], logs: [] };
  // load aps from ap-config.json if empty
  if((db.data.aps || []).length === 0) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'ap-config.json')));
      db.data.aps = cfg.aps || [];
      await db.write();
    } catch(e) {
      console.warn("No ap-config.json found or invalid");
    }
  }
}
initDB();

// helper
async function saveLog(msg, level='info'){
  await db.read();
  db.data.logs.unshift({ id: nanoid(8), ts: Date.now(), level, msg });
  if(db.data.logs.length>500) db.data.logs.length = 500;
  await db.write();
  io.emit('logs:update', db.data.logs.slice(0,50));
}

// ----------------- API -----------------

// list APs
app.get('/api/devices', async (req,res)=>{
  await db.read();
  res.json(db.data.aps || []);
});

// add/update AP (adopt)
app.post('/api/devices', async (req,res)=>{
  const payload = req.body;
  if(!payload.id || !payload.host) return res.status(400).send('id & host required');
  await db.read();
  const exists = db.data.aps.find(a=>a.id===payload.id);
  if(exists) {
    Object.assign(exists, payload);
  } else {
    db.data.aps.push(payload);
  }
  await db.write();
  await saveLog(`AP ${payload.id} added/updated`);
  io.emit('aps:update', payload);
  res.json({ok:true});
});

// reboot AP (restart hostapd + dnsmasq)
app.post('/api/devices/:id/reboot', async (req,res)=>{
  const id = req.params.id;
  await db.read();
  const ap = db.data.aps.find(a=>a.id===id);
  if(!ap) return res.status(404).send('AP not found');
  const cmd = "sudo systemctl restart hostapd && sudo systemctl restart dnsmasq";
  try {
    const r = await sshExec(ap.host, ap.sshUser, ap.sshPassword, cmd);
    await saveLog(`Reboot ${id} => ${r.code}`);
    return res.json({ok:true, out: r.stdout, err: r.stderr});
  } catch(e) {
    await saveLog(`Reboot ${id} failed: ${e.message}`, 'error');
    return res.status(500).json({ok:false, err: e.message});
  }
});

// change SSID/password (edits /etc/hostapd/hostapd.conf via sed and restart)
app.post('/api/devices/:id/ssid', async (req,res)=>{
  const id = req.params.id;
  const { ssid, password } = req.body;
  if(!ssid || !password) return res.status(400).send('ssid & password required');
  await db.read();
  const ap = db.data.aps.find(a=>a.id===id); if(!ap) return res.status(404).send('AP not found');
  // safer to write a small tmp file and move it
  const cmd = `sudo bash -lc "if [ -f /etc/hostapd/hostapd.conf ]; then sudo sed -i -E 's/^ssid=.*/ssid=${ssid.replace(/"/g,'\\"')}/' /etc/hostapd/hostapd.conf || true; sudo sed -i -E 's/^wpa_passphrase=.*/wpa_passphrase=${password.replace(/"/g,'\\"')}/' /etc/hostapd/hostapd.conf || true; sudo systemctl restart hostapd; echo OK; else echo 'hostapd.conf-not-found'; fi"`;
  try {
    const r = await sshExec(ap.host, ap.sshUser, ap.sshPassword, cmd);
    await saveLog(`SSID change on ${id} => ${ssid}`);
    return res.json({ok:true, out:r.stdout});
  } catch(e) {
    await saveLog(`SSID change failed on ${id}: ${e.message}`, 'error');
    return res.status(500).json({ok:false, err:e.message});
  }
});

// apply VLAN (example: set UCI network reference, commit and reload wifi)
app.post('/api/devices/:id/vlan', async (req,res)=>{
  const id = req.params.id; const { vlan } = req.body;
  if(typeof vlan === 'undefined') return res.status(400).send('vlan required');
  await db.read(); const ap = db.data.aps.find(a=>a.id===id); if(!ap) return res.status(404).send('AP not found');
  const cmd = `sudo bash -lc "uci set wireless.@wifi-iface[0].network='VLAN${vlan}'; uci commit wireless; wifi reload; echo OK"`;
  try {
    const r = await sshExec(ap.host, ap.sshUser, ap.sshPassword, cmd);
    ap.vlan = vlan; await db.write();
    await saveLog(`VLAN ${vlan} applied to ${id}`);
    io.emit('aps:update', ap);
    return res.json({ok:true});
  } catch(e) {
    await saveLog(`VLAN apply failed on ${id}: ${e.message}`, 'error');
    return res.status(500).json({ok:false, err:e.message});
  }
});

// configure DHCP range (dnsmasq)
app.post('/api/devices/:id/dhcp', async (req,res)=>{
  const id = req.params.id; const { start, end, lease } = req.body;
  if(!start || !end) return res.status(400).send('start & end required');
  await db.read(); const ap = db.data.aps.find(a=>a.id===id); if(!ap) return res.status(404).send('AP not found');
  const conf = `dhcp-range=${start},${end},${lease || '12h'}`;
  const cmd = `sudo bash -lc "cat > /tmp/10-mini-dhcp.conf <<'EOF'\n${conf}\nEOF\nsudo mv /tmp/10-mini-dhcp.conf /etc/dnsmasq.d/10-mini-dhcp.conf\nsudo systemctl restart dnsmasq\necho OK"`;
  try {
    const r = await sshExec(ap.host, ap.sshUser, ap.sshPassword, cmd);
    await saveLog(`DHCP updated on ${id} ${start}-${end}`);
    return res.json({ok:true});
  } catch(e) {
    await saveLog(`DHCP update failed on ${id}: ${e.message}`, 'error');
    return res.status(500).json({ok:false, err:e.message});
  }
});

// get clients from AP (tries dnsmasq leases or iw)
app.get('/api/devices/:id/clients', async (req,res)=>{
  const id = req.params.id;
  await db.read(); const ap = db.data.aps.find(a=>a.id===id); if(!ap) return res.status(404).send('AP not found');
  try {
    // try dnsmasq leases
    let r = await sshExec(ap.host, ap.sshUser, ap.sshPassword, "cat /var/lib/misc/dnsmasq.leases || true");
    let clients = [];
    if(r.stdout && r.stdout.trim()) {
      r.stdout.split('\n').forEach(line=>{
        const parts = line.trim().split(/\s+/);
        if(parts.length>=4) clients.push({mac:parts[1], ip:parts[2], hostname:parts[3]});
      });
    } else {
      // fallback to iw
      r = await sshExec(ap.host, ap.sshUser, ap.sshPassword, "iw dev wlan0 station dump || true");
      const arr = r.stdout.split(/\n\s*\n/).filter(Boolean);
      arr.forEach(block=>{
        const macLine = block.split('\n')[0].trim();
        if(macLine.startsWith('Station ')) {
          const mac = macLine.split(' ')[1];
          clients.push({mac, ip:null, hostname:null});
        }
      });
    }
    // persist clients in DB for global view
    await db.read();
    // replace clients for this AP
    db.data.clients = (db.data.clients || []).filter(c=>c.ap !== id);
    const now = Date.now();
    clients.forEach(c=>{
      db.data.clients.push({id: nanoid(), ap: id, mac: c.mac, ip: c.ip || '', hostname: c.hostname || '', last_seen: now});
    });
    await db.write();
    io.emit('clients:update', db.data.clients.slice(-200));
    await saveLog(`Fetched clients from ${id}`);
    return res.json(clients);
  } catch(e) {
    await saveLog(`Get clients failed on ${id}: ${e.message}`, 'error');
    return res.status(500).json({ok:false, err:e.message});
  }
});

// list all clients (global)
app.get('/api/clients', async (req,res)=>{
  await db.read();
  res.json(db.data.clients || []);
});

// vlans management (simple)
app.get('/api/vlans', async (req,res)=>{
  await db.read(); res.json(db.data.vlans || []);
});
app.post('/api/vlans', async (req,res)=>{
  const { id, name } = req.body; if(!id || !name) return res.status(400).send('id & name');
  await db.read(); db.data.vlans.push({id, name}); await db.write(); await saveLog(`VLAN ${id} created`); res.json({ok:true});
});

// wlans (SSIDs) management local (UI-created); pushing to APs is explicit action
app.get('/api/wlans', async (req,res)=>{ await db.read(); res.json(db.data.wlans || []); });
app.post('/api/wlans', async (req,res)=>{ const { ssid, vlan } = req.body; if(!ssid) return res.status(400); await db.read(); db.data.wlans.push({id:nanoid(6), ssid, vlan}); await db.write(); await saveLog(`WLAN ${ssid} created`); res.json({ok:true}); });

// logs
app.get('/api/logs', async (req,res)=>{ await db.read(); res.json(db.data.logs || []); });

// serve frontend (built) else index fallback is already handled by express.static

// Background polling: poll all APs clients every X seconds
setInterval(async ()=>{
  await db.read();
  const aps = db.data.aps || [];
  for(const a of aps){
    try {
      // attempt get clients (no need to write response)
      await sshExec(a.host, a.sshUser, a.sshPassword, "cat /var/lib/misc/dnsmasq.leases || true");
      // emit a simple heartbeat
      io.emit('aps:heartbeat', { id: a.id, ts: Date.now() });
    } catch(e){
      // ignore
    }
  }
}, 10000);

// socket.io connections
io.on('connection', (socket)=>{
  console.log('socket connected');
  socket.emit('init', {aps: db.data.aps || [], clients: db.data.clients || []});
});

// start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> {
  console.log(`Backend server listening on ${PORT}`);
});

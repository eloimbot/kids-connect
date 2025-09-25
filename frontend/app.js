document.querySelectorAll('.side-btn').forEach(b => b.addEventListener('click',()=>{
  document.querySelectorAll('.side-btn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(b.dataset.page).classList.add('active');
}));

async function refreshAll() {
  const devices = await (await fetch('/api/devices')).json();
  const clients = await (await fetch('/api/clients')).json();
  
  // Device list
  const devList = document.getElementById('deviceList');
  devList.innerHTML = devices.map(d=>`<div>${d.name} (VLAN ${d.vlan||'—'})</div>`).join('');
  
  // Clients list
  const clBox = document.getElementById('clientsBox');
  clBox.innerHTML = clients.map(c=>`<div>${c.name} — ${c.ap}</div>`).join('');
}

refreshAll();
setInterval(refreshAll,3000);

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { runCommand } = require('./apManager');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // servir UI

// API: listar APs
app.get('/api/devices', (req,res) => {
  db.all("SELECT * FROM aps", (err, rows) => res.json(rows || []));
});

// API: listar clientes
app.get('/api/clients', (req,res) => {
  db.all("SELECT * FROM clients", (err, rows) => res.json(rows || []));
});

// API: configurar VLAN
app.post('/api/devices/:id/config', async (req,res) => {
  const { vlan } = req.body;
  db.get("SELECT * FROM aps WHERE id=?", [req.params.id], async (err, ap) => {
    if(!ap) return res.status(404).send('AP no encontrado');
    try {
      // ejemplo: cambiar VLAN via SSH en AP
      await runCommand(ap, `uci set wireless.@wifi-iface[0].network='VLAN${vlan}' && uci commit wireless && wifi reload`);
      db.run("UPDATE aps SET vlan=? WHERE id=?", [vlan, ap.id]);
      res.send('Configuración aplicada');
    } catch(e) { res.status(500).send(e.message); }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));

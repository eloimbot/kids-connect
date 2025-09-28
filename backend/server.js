```js
import express from "express";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos con lowdb v7 (JSONPreset crea y carga automáticamente el JSON)
const dbFile = join(__dirname, "db.json");
const db = await JSONFilePreset(dbFile, { aps: [], settings: {} });

// -------------------------
// RUTAS API
// -------------------------

// Listar APs
app.get("/api/aps", async (req, res) => {
  await db.read();
  res.json(db.data.aps);
});

// Añadir un AP
app.post("/api/aps", async (req, res) => {
  const newAp = req.body;
  db.data.aps.push(newAp);
  await db.write();
  res.status(201).json(newAp);
});

// Eliminar un AP por id
app.delete("/api/aps/:id", async (req, res) => {
  const { id } = req.params;
  db.data.aps = db.data.aps.filter((ap) => ap.id !== id);
  await db.write();
  res.status(204).end();
});

// Obtener configuración general
app.get("/api/settings", async (req, res) => {
  await db.read();
  res.json(db.data.settings);
});

// Actualizar configuración general
app.post("/api/settings", async (req, res) => {
  db.data.settings = req.body;
  await db.write();
  res.json(db.data.settings);
});

// -------------------------
// INICIAR SERVIDOR
// -------------------------
app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:"+ PORT);
});
```

```bash
#!/bin/bash

# ===============================
# Install script for Kids-Connect
# ===============================

set -e

echo "🔄 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "📦 Instalando dependencias..."
sudo apt install -y git curl nodejs npm

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no se instaló correctamente. Abortando."
  exit 1
fi

# Carpeta de instalación
INSTALL_DIR="$HOME/Documents/kids-connect"

# Clonar o actualizar repo
if [ -d "$INSTALL_DIR" ]; then
  echo "📂 El repositorio ya existe, actualizando..."
  cd "$INSTALL_DIR"
  git pull
else
  echo "⬇️ Clonando repositorio..."
  mkdir -p "$HOME/Documents"
  cd "$HOME/Documents"
  git clone https://github.com/eloimbot/kids-connect.git
  cd kids-connect
fi

# Backend
echo "⚙️ Instalando dependencias del backend..."
cd backend
npm install

# Frontend
echo "⚙️ Instalando dependencias del frontend..."
cd ../frontend
npm install

echo "✅ Instalación completada."
echo "👉 Para arrancar el backend: cd $INSTALL_DIR/backend && npm start"
echo "👉 Para arrancar el frontend: cd $INSTALL_DIR/frontend && npm run dev"
```

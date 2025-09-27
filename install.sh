#!/bin/bash
set -e

REPO="https://github.com/eloimbot/kids-connect.git"
DIR="/opt/kids-connect"
BACKEND_DIR="$DIR/backend"
FRONTEND_DIR="$DIR/frontend"
SERVICE_NAME="kids-connect.service"

echo "=== Instalación Kids-Connect en Linux ==="

# Dependencias
apt update
apt install -y git curl build-essential nginx

# Node.js
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
echo "🔧 Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "📦 Instalando dependencias..."
sudo apt install -y git curl

# Instalar Node.js 20 si no existe
if ! command -v node &> /dev/null; then
  echo "⬇️ Instalando Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# Clonar repo
if [ -d "$DIR" ]; then
  cd "$DIR"
# Carpeta de instalación
INSTALL_DIR=~/Documents/kids-connect

# Si ya existe, actualizar
if [ -d "$INSTALL_DIR" ]; then
  echo "📂 Carpeta ya existe, actualizando repo..."
  cd "$INSTALL_DIR"
  git pull
else
  git clone "$REPO" "$DIR"
  echo "⬇️ Clonando repo..."
  git clone https://github.com/eloimbot/kids-connect.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# Backend
cd "$BACKEND_DIR"
echo "⚙️ Instalando dependencias backend..."
cd backend
npm install

# Frontend
cd "$FRONTEND_DIR"
echo "⚙️ Instalando dependencias frontend..."
cd ../frontend
npm install
npm run build

# Servicio systemd
cat <<EOF | sudo tee /etc/systemd/system/$SERVICE_NAME
[Unit]
Description=Kids-Connect Backend
After=network.target

[Service]
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/node $BACKEND_DIR/server.js
Restart=always
User=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl restart $SERVICE_NAME

echo "=== Kids-Connect instalado en Linux ==="
echo "Accede en http://<IP>:3000 o configura NGINX si quieres HTTPS"

echo "🚀 Iniciando backend..."
cd ../backend
nohup npm start > backend.log 2>&1 &

echo "🚀 Iniciando frontend..."
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &

echo "✅ Instalación completa."
echo "Frontend disponible en: http://localhost:5173"
echo "Backend disponible en: http://localhost:5000"

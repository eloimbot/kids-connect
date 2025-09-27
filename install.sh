#!/bin/bash
set -e

REPO="https://github.com/eloimbot/kids-connect.git"
INSTALL_DIR="$HOME/Documents/kids-connect"
BACKEND_DIR="$INSTALL_DIR/backend"
FRONTEND_DIR="$INSTALL_DIR/frontend"
SERVICE_NAME="kids-connect.service"

echo "=== Instalación Kids-Connect en Linux ==="

# Actualizar sistema e instalar dependencias básicas
sudo apt update
sudo apt install -y git curl build-essential nginx

# Instalar Node.js 20 si no está instalado
if ! command -v node &> /dev/null; then
    echo "⬇️ Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Clonar o actualizar repo
if [ -d "$INSTALL_DIR" ]; then
    echo "📂 Carpeta ya existe, actualizando repo..."
    cd "$INSTALL_DIR"
    git pull
else
    echo "⬇️ Clonando repo..."
    git clone "$REPO" "$INSTALL_DIR"
fi

# Backend
echo "⚙️ Instalando dependencias backend..."
cd "$BACKEND_DIR"
npm install

# Frontend
echo "⚙️ Instalando dependencias frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

# Crear servicio systemd para backend
sudo tee /etc/systemd/system/$SERVICE_NAME > /dev/null <<EOF
[Unit]
Description=Kids-Connect Backend
After=network.target

[Service]
WorkingDirectory=$BACKEND_DIR
ExecStart=/usr/bin/node $BACKEND_DIR/server.js
Restart=always
User=$USER
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl restart $SERVICE_NAME

echo "=== Kids-Connect instalado en Linux ==="
echo "Frontend disponible en: http://localhost:5173"
echo "Backend disponible en: http://localhost:5000"

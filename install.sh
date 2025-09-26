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
fi

# Clonar repo
if [ -d "$DIR" ]; then
  cd "$DIR"
  git pull
else
  git clone "$REPO" "$DIR"
fi

# Backend
cd "$BACKEND_DIR"
npm install

# Frontend
cd "$FRONTEND_DIR"
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

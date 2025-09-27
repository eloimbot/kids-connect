#!/bin/bash
set -e

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

# Carpeta de instalación
INSTALL_DIR=~/Documents/kids-connect

# Si ya existe, actualizar
if [ -d "$INSTALL_DIR" ]; then
  echo "📂 Carpeta ya existe, actualizando repo..."
  cd "$INSTALL_DIR"
  git pull
else
  echo "⬇️ Clonando repo..."
  git clone https://github.com/eloimbot/kids-connect.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

echo "⚙️ Instalando dependencias backend..."
cd backend
npm install

echo "⚙️ Instalando dependencias frontend..."
cd ../frontend
npm install

echo "🚀 Iniciando backend..."
cd ../backend
nohup npm start > backend.log 2>&1 &

echo "🚀 Iniciando frontend..."
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &

echo "✅ Instalación completa."
echo "Frontend disponible en: http://localhost:5173"
echo "Backend disponible en: http://localhost:5000"

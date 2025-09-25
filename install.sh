#!/bin/bash
# Instala Node.js, npm y dependencias
echo "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clonar repositorio
git clone https://github.com/eloimbot/custom-router-linux.git controller
cd controller/backend

# Instalar dependencias Node.js
npm install

echo "Instalación completa. Ejecuta 'npm start' desde backend para iniciar el servidor."

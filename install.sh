```bash
#!/bin/bash
set -e  # Si algo falla, el script se detiene

# Actualizar paquetes
sudo apt update
sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y git nodejs npm

# Definir carpeta de instalación
INSTALL_DIR="$HOME/Documents/kids-connect"

# Clonar o actualizar el repositorio
if [ -d "$INSTALL_DIR" ]; then
    echo "Repositorio ya existe, actualizando..."
    cd "$INSTALL_DIR"
    git pull
else
    echo "Clonando repositorio..."
    mkdir -p "$HOME/Documents"
    git clone https://github.com/eloimbot/kids-connect.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

echo "✅ Instalación completada. Para arrancar:"
echo "   cd $INSTALL_DIR/backend && npm start   # Inicia el backend"
echo "   cd $INSTALL_DIR/frontend && npm run dev # Inicia el frontend"
```

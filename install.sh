```bash
#!/bin/bash
set -e

# === Kids Connect Install Script ===
# Instala dependencias, clona o actualiza el repo y arranca frontend + backend

# 1. Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# 2. Instalar dependencias
sudo apt-get install -y git nodejs npm

# 3. Crear carpeta en Documentos si no existe
PROJECT_DIR="$HOME/Documents/kids-connect"
mkdir -p "$PROJECT_DIR"

# 4. Clonar o actualizar repo
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "Repositorio encontrado, actualizando..."
    cd "$PROJECT_DIR"
    git pull
else
    echo "Clonando repositorio..."
    git clone https://github.com/eloimbot/kids-connect.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# 5. Instalar dependencias frontend y backend
cd frontend
npm install
cd ../backend
npm install

echo "Instalación completada ✅"
echo "Para arrancar el backend: cd $PROJECT_DIR/backend && npm start"
echo "Para arrancar el frontend: cd $PROJECT_DIR/frontend && npm run dev"
```

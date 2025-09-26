Write-Host "=== Instalación Kids-Connect en Windows ==="

# Variables
$repo = "https://github.com/eloimbot/kids-connect.git"
$dir = "$env:USERPROFILE\kids-connect"
$backend = "$dir\backend"
$frontend = "$dir\frontend"

# Instalar Chocolatey si no existe
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

# Node.js y Git
choco install -y nodejs git

# Clonar repo
if (Test-Path $dir) {
    Write-Host "Repo ya existe, actualizando..."
    cd $dir
    git pull
} else {
    git clone $repo $dir
}

# Backend
cd $backend
npm install

# Frontend
cd $frontend
npm install
npm run build

# Instalar pm2 para mantener el server activo
npm install -g pm2

# Arrancar backend con pm2
cd $backend
pm2 start server.js --name kids-connect
pm2 save

Write-Host "=== Kids-Connect instalado en Windows ==="
Write-Host "Backend corriendo con PM2, se reinicia automáticamente"
Write-Host "Frontend en carpeta $frontend\dist"

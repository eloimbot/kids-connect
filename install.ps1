# install.ps1 - Script de instalación para Windows
# Clona el repo en Documentos y configura el proyecto

Write-Host "=== Instalador Kids-Connect (Windows) ==="

# Ruta de Documentos (independiente del idioma del sistema)
$docsPath = Join-Path $env:USERPROFILE "Documents"
$installPath = Join-Path $docsPath "kids-connect"

# 1. Verificar que Git esté instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git no está instalado. Descárgalo en https://git-scm.com/download/win"
    exit 1
}

# 2. Verificar que Node.js esté instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js no está instalado. Descárgalo en https://nodejs.org/"
    exit 1
}

# 3. Instalar pm2 si no está
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando PM2..."
    npm install -g pm2
}

# 4. Eliminar carpeta previa si existe
if (Test-Path $installPath) {
    Write-Host "Eliminando instalación previa..."
    Remove-Item -Recurse -Force $installPath
}

# 5. Clonar el repositorio
Write-Host "Clonando repositorio en $installPath ..."
git clone https://github.com/eloimbot/kids-connect $installPath

# 6. Instalar dependencias
Write-Host "Instalando dependencias..."
cd "$installPath\backend"
npm install

cd "$installPath\frontend"
npm install
npm run build

# 7. Iniciar servidor con PM2
cd "$installPath\backend"
pm2 start server.js --name "kids-connect"
pm2 save

Write-Host "=== Instalación completada ==="
Write-Host "La aplicación Kids-Connect está instalada en: $installPath"
Write-Host "Se está ejecutando en segundo plano con PM2."
Write-Host "Para ver el estado: pm2 list"

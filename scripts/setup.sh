#!/bin/bash

# Booleana AI - Setup Script
# Este script inicializa tanto el frontend como el backend del proyecto

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    BOOLEANA AI SETUP                         ║"
echo "║              Inicializando Frontend y Backend                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar prerrequisitos
print_status "Verificando prerrequisitos..."

# Verificar Node.js y npm
if ! command_exists node; then
    print_error "Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm no está instalado. Por favor instala npm."
    exit 1
fi

# Verificar Deno
if ! command_exists deno; then
    print_error "Deno no está instalado. Por favor instala Deno desde https://deno.land/"
    print_status "Puedes instalarlo con: curl -fsSL https://deno.land/x/install/install.sh | sh"
    exit 1
fi

print_success "Todos los prerrequisitos están instalados"

# Obtener versiones
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
DENO_VERSION=$(deno --version | head -n1)

print_status "Node.js: $NODE_VERSION"
print_status "npm: $NPM_VERSION"
print_status "Deno: $DENO_VERSION"

echo ""
print_status "Iniciando configuración del proyecto..."

# ============================================================================
# CONFIGURACIÓN DEL BACKEND
# ============================================================================

print_status "Configurando Backend (Deno)..."

cd backend

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando archivo .env de ejemplo..."
    cat > .env << EOF
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key_here"

# Server Configuration
PORT=8000
EOF
    print_warning "⚠️  IMPORTANTE: Configura las variables de entorno en backend/.env antes de ejecutar el servidor"
fi

# Crear import_map.json si no existe
if [ ! -f import_map.json ]; then
    print_status "Creando import_map.json..."
    cat > import_map.json << EOF
{
  "imports": {}
}
EOF
fi

# Verificar que las dependencias de Deno se puedan resolver
print_status "Verificando dependencias de Deno..."
if deno check src/app.ts; then
    print_success "Dependencias de Deno verificadas correctamente"
else
    print_warning "Algunas dependencias de Deno podrían no estar disponibles"
fi

cd ..

print_success "Backend configurado correctamente"

# ============================================================================
# CONFIGURACIÓN DEL FRONTEND
# ============================================================================

print_status "Configurando Frontend (Angular)..."

cd frontend

# Instalar dependencias de npm
print_status "Instalando dependencias de npm..."
if npm install; then
    print_success "Dependencias de npm instaladas correctamente"
else
    print_error "Error al instalar dependencias de npm"
    exit 1
fi

# Verificar que Angular CLI esté disponible
if ! command_exists ng; then
    print_status "Angular CLI no encontrado globalmente. Usando versión local..."
    NG_CMD="npx ng"
else
    NG_CMD="ng"
fi

# Crear archivos de configuración TypeScript si no existen
print_status "Verificando archivos de configuración TypeScript..."

if [ ! -f tsconfig.json ]; then
    print_status "Creando tsconfig.json..."
    cat > tsconfig.json << 'EOF'
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
EOF
fi

if [ ! -f tsconfig.app.json ]; then
    print_status "Creando tsconfig.app.json..."
    cat > tsconfig.app.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": [
      "node"
    ]
  },
  "files": [
    "src/main.ts",
    "src/main.server.ts",
    "src/server.ts"
  ],
  "include": [
    "src/**/*.d.ts"
  ],
  "exclude": [
    "src/**/*.test.ts",
    "src/**/*.spec.ts"
  ]
}
EOF
fi

if [ ! -f tsconfig.spec.json ]; then
    print_status "Creando tsconfig.spec.json..."
    cat > tsconfig.spec.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jasmine",
      "node"
    ]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.d.ts"
  ]
}
EOF
fi

# Verificar configuración de Angular
print_status "Verificando configuración de Angular..."
if $NG_CMD version > /dev/null 2>&1; then
    print_success "Angular configurado correctamente"
else
    print_warning "Posibles problemas con la configuración de Angular"
fi

cd ..

print_success "Frontend configurado correctamente"

# ============================================================================
# CONFIGURACIÓN FINAL
# ============================================================================

print_status "Configuración final..."

# Crear scripts de desarrollo si no existen
if [ ! -f scripts/dev.sh ]; then
    print_status "Creando script de desarrollo..."
    cat > scripts/dev.sh << 'EOF'
#!/bin/bash

# Script para ejecutar frontend y backend en desarrollo
# Requiere 'concurrently' instalado globalmente: npm install -g concurrently

if ! command -v concurrently >/dev/null 2>&1; then
    echo "Instalando concurrently..."
    npm install -g concurrently
fi

echo "Iniciando Frontend y Backend en modo desarrollo..."

concurrently \
    --names "BACKEND,FRONTEND" \
    --prefix-colors "red,blue" \
    "cd backend && deno task start" \
    "cd frontend && npm start"
EOF
    chmod +x scripts/dev.sh
fi

# Crear script de producción si no existe
if [ ! -f scripts/prod.sh ]; then
    print_status "Creando script de producción..."
    cat > scripts/prod.sh << 'EOF'
#!/bin/bash

echo "Construyendo aplicación para producción..."

# Construir frontend
echo "Construyendo frontend..."
cd frontend
npm run build
cd ..

echo "Frontend construido en frontend/dist/"
echo "Para ejecutar el backend: cd backend && deno task start"
EOF
    chmod +x scripts/prod.sh
fi

print_success "Scripts de desarrollo y producción creados"

# ============================================================================
# RESUMEN Y PRÓXIMOS PASOS
# ============================================================================

echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETADO                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_success "¡Configuración completada exitosamente!"

echo ""
print_status "PRÓXIMOS PASOS:"
echo ""
echo "1. 📝 Configura las variables de entorno:"
echo "   - Edita backend/.env con tus credenciales de OpenAI y Firebase"
echo ""
echo "2. 🚀 Para desarrollo:"
echo "   - Ejecuta: ./scripts/dev.sh (requiere concurrently)"
echo "   - O manualmente:"
echo "     • Backend: cd backend && deno task start"
echo "     • Frontend: cd frontend && npm start"
echo ""
echo "3. 🏗️ Para producción:"
echo "   - Ejecuta: ./scripts/prod.sh"
echo ""
echo "4. 🌐 URLs por defecto:"
echo "   - Frontend: http://localhost:4200"
echo "   - Backend: http://localhost:8000"
echo ""

if [ -f backend/.env ]; then
    if grep -q "your_openai_api_key_here" backend/.env; then
        print_warning "⚠️  Recuerda configurar las variables de entorno en backend/.env"
    fi
fi

print_status "Let´s go ma boys!!!"
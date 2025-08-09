#!/bin/bash

# Script para ejecutar frontend y backend en desarrollo
# Requiere 'concurrently' instalado globalmente: npm install -g concurrently

if ! command -v concurrently >/dev/null 2>&1; then
    echo "Instalando concurrently..."
    npm install -g concurrently
fi

echo "Iniciando Frontend y Backend en modo desarrollo..."

concurrently \
    --names "BACKEND,FRONTEND,MFE-REACT" \
    --prefix-colors "red,blue,green" \
    "cd backend && deno task start" \
    "cd frontend && npm start" \
    "cd mfe-react && npm start"

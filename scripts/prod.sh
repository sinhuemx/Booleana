#!/bin/bash

echo "Construyendo aplicación para producción..."

# Construir frontend
echo "Construyendo frontend..."
cd frontend
npm run build
cd ..

echo "Frontend construido en frontend/dist/"
echo "Para ejecutar el backend: cd backend && deno task start"

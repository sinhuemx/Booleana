# Cómo Iniciar el Proyecto Booleana

Este documento describe cómo iniciar los diferentes componentes del proyecto Booleana (Backend, Frontend y Microfrontend de React) en modo desarrollo.

## Iniciar todos los servicios (Recomendado)

Para iniciar el **Backend (Deno)**, el **Frontend (Angular)** y el **Microfrontend (React)** simultáneamente, utiliza el script `dev.sh`:

```bash
./scripts/dev.sh
```

Este script utiliza `concurrently` para ejecutar los tres servicios en paralelo. Si `concurrently` no está instalado globalmente, el script intentará instalarlo automáticamente.

Una vez iniciado, podrás acceder a:

*   **Backend:** `http://localhost:8000` (o el puerto configurado en `backend/.env`)
*   **Frontend:** `http://localhost:4200` (o el puerto por defecto de Angular)
*   **Microfrontend (React):** `http://localhost:3000` (o el puerto por defecto de React)

## Iniciar servicios individualmente (Opcional)

Si necesitas iniciar los servicios de forma individual, puedes hacerlo de la siguiente manera:

### Backend (Deno)

```bash
cd backend
deno task start
```

### Frontend (Angular)

```bash
cd frontend
npm start
```

### Microfrontend (React)

```bash
cd mfe-react
npm start
```

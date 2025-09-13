# Bug Tracker Frontend

Frontend completo para una plataforma de reporte de bugs usando Next.js 15 con App Router y Tailwind CSS.

## Características

- ✅ Autenticación con JWT (Login/Registro)
- ✅ Lista de bugs con diseño responsive
- ✅ Creación de bugs con subida de imágenes
- ✅ Navegación protegida con rutas
- ✅ Diseño moderno con Tailwind CSS
- ✅ Integración completa con backend

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
# Copiar el archivo de ejemplo
cp env.example .env.local

# Editar .env.local con tu configuración
# NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Estructura del Proyecto

```
app/
├── layout.jsx              # Layout principal
├── page.jsx                # Home / Lista de bugs
├── auth/
│   ├── login.jsx          # Página de login
│   └── register.jsx       # Página de registro
├── bugs/
│   └── create.jsx         # Crear nuevo bug
├── components/
│   ├── Navbar.jsx         # Barra de navegación
│   ├── BugCard.jsx        # Tarjeta de bug
│   └── UploadImage.jsx    # Componente de subida de imagen
└── utils/
    ├── api.js             # Funciones de API
    └── auth.js            # Funciones de autenticación

app/hooks/
└── useAuth.jsx            # Hook para protección de rutas
```

## Funcionalidades

### Autenticación
- Login y registro de usuarios
- Almacenamiento de JWT en localStorage
- Protección de rutas automática

### Gestión de Bugs
- Lista de bugs en grid responsive
- Vista de detalle completa para cada bug
- Creación de bugs con título, descripción e imagen
- Subida de imágenes a Cloudinary
- Estados de bug (abierto, cerrado, en progreso)
- IDs numéricos secuenciales simples (1, 2, 3, 4, etc.)
- Navegación clickeable entre lista y detalles

### Diseño
- Interfaz moderna con Tailwind CSS
- Responsive design para móvil y desktop
- Animaciones y transiciones suaves
- Componentes reutilizables

## Configuración de Variables de Entorno

El proyecto usa variables de entorno para configurar la URL del backend:

- **`NEXT_PUBLIC_API_URL`**: URL base del backend API (por defecto: `http://localhost:3000/api`)

Para cambiar la configuración, edita el archivo `.env.local`:
```bash
# Desarrollo local
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Producción
NEXT_PUBLIC_API_URL=https://tu-servidor.com/api
```

## Backend

El frontend está configurado para conectarse con un backend que debe incluir:

- Endpoints de autenticación (`/auth/login`, `/auth/register`)
- Endpoints de bugs (`/bugs`, `/bugs/upload`)
- Autenticación JWT en headers Authorization

## Tecnologías

- **Next.js 15** con App Router
- **React 18**
- **Tailwind CSS** para estilos
- **JavaScript ES6+**
- **Fetch API** para comunicación con backend

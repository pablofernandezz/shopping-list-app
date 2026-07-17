# 🛒 Full-Stack Shopping List App

Una aplicación móvil interactiva para gestionar la lista de la compra en tiempo real y de forma compartida con el resto de la familia. Este proyecto implementa una arquitectura cliente-servidor completa (Full-Stack), permitiendo crear, leer, actualizar y eliminar (CRUD) artículos, con persistencia de datos en la nube.

## ✨ Características Principales

*   **Sincronización en la nube:** Los datos persisten en una base de datos remota, permitiendo acceder a la lista desde cualquier dispositivo conectado a la red.
*   **Autocompletado Inteligente:** Sistema de sugerencias en tiempo real mientras el usuario escribe.
*   **Asignación de Emojis Dinámica:** Un algoritmo de búsqueda parcial asigna automáticamente el icono correspondiente al producto añadido (ej. "Manzanas" -> 🍎).
*   **Gestos Nativos (Swipe-to-delete):** Experiencia de usuario fluida deslizando los elementos hacia la izquierda para eliminarlos.
*   **Interfaz Reactiva:** Actualizaciones de estado instantáneas y función "Pull-to-refresh" para recargar la lista de la base de datos.

## 🛠️ Tecnologías Utilizadas

**Frontend (Aplicación Móvil):**
*   [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
*   TypeScript
*   React Native Gesture Handler

**Backend (API REST):**
*   [Node.js](https://nodejs.org/)
*   [Express.js](https://expressjs.com/)
*   [Mongoose](https://mongoosejs.com/) (Modelado de datos)

**Base de Datos & Despliegue:**
*   [MongoDB Atlas](https://www.mongodb.com/atlas) (Base de datos NoSQL en la nube)
*   [Render](https://render.com/) (PaaS para alojamiento del backend)

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para ejecutar una copia del proyecto en tu máquina local.

### 1. Clonar el repositorio
```bash
git clone https://github.com/pablofernandezz/shopping-list-app.git
cd shopping-list-app
```

### 2. Configurar el Backend
Navega a la carpeta del servidor e instala las dependencias:
```bash
cd backend
npm install
```

Crea un archivo `.env` en el directorio `backend` y añade tu propia cadena de conexión a MongoDB (necesitarás registrarte en MongoDB Atlas para obtener tu propio clúster gratuito):
```env
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0...
```

Inicia el servidor local:
```bash
node index.js
```
El servidor se ejecutará en `http://localhost:3000`.

### 3. Configurar el Frontend
Abre una nueva terminal, navega a la carpeta de la aplicación móvil e instala las dependencias:
```bash
cd lista-compra-app
npm install
```

**Importante:** En el archivo `app/index.tsx`, debes sustituir la variable `API_URL` para que apunte a tu propia infraestructura. Borra la URL de demostración que viene por defecto y añade tu IP local o tu servidor de producción:
```typescript
const API_URL = 'http://TU_IP_LOCAL:3000'; // Entorno de desarrollo o tu propia URL de producción
```

Inicia la aplicación con Expo:
```bash
npx expo start
```
Escanea el código QR con la aplicación Expo Go en tu dispositivo móvil.

## 📁 Estructura del Proyecto

```text
shopping-list-app/
├── backend/                  # Código del servidor (Node.js + Express)
│   ├── index.js              # Archivo principal de la API REST
│   └── package.json          # Dependencias del backend
└── lista-compra-app/         # Código de la aplicación móvil (React Native)
    ├── app/
    │   ├── index.tsx         # Pantalla principal y lógica de la UI
    │   ├── diccionario.ts    # Lógica de autocompletado y emojis
    │   └── styles.ts         # Hojas de estilo
    ├── package.json          # Dependencias del frontend
    └── app.json              # Configuración de Expo
```

## 📝 Trabajo Futuro

*   Empaquetado de binarios nativos (.apk para Android y .ipa para iOS).
*   Añadir feedback visual (ActivityIndicator) durante las peticiones de red por alta latencia.
*   Implementación de listas colaborativas multiusuario.
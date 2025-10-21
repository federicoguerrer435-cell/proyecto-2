# Creditos Backend

Backend de plataforma de créditos desarrollado con Node.js, Express y Clean Architecture. Este proyecto implementa un sistema de autenticación JWT básico y gestión de usuarios con base de datos PostgreSQL.

## 🏗️ Arquitectura

El proyecto sigue los principios de **Clean Architecture**, separando el código en capas bien definidas:

### Estructura de Carpetas

```
src/
├── domain/                 # Capa de Dominio
│   ├── entities/          # Entidades del negocio
│   │   └── User.js        # Entidad Usuario
│   └── repositories/      # Interfaces de repositorios
│       └── UserRepository.js
│
├── application/           # Capa de Aplicación
│   ├── use-cases/        # Casos de uso (lógica de negocio)
│   │   ├── RegisterUserUseCase.js
│   │   └── LoginUserUseCase.js
│   └── services/         # Servicios de aplicación
│
├── infrastructure/        # Capa de Infraestructura
│   ├── database/         # Configuración de base de datos
│   │   └── postgres.js
│   ├── repositories/     # Implementaciones de repositorios
│   │   └── PostgresUserRepository.js
│   └── security/         # Servicios de seguridad
│       ├── JwtService.js
│       └── PasswordService.js
│
└── presentation/          # Capa de Presentación
    ├── controllers/       # Controladores HTTP
    │   └── AuthController.js
    ├── middlewares/       # Middlewares de Express
    │   └── authMiddleware.js
    └── routes/           # Definición de rutas
        └── authRoutes.js
```

### Capas de la Arquitectura

#### 1. **Capa de Dominio** (Domain Layer)
- **Entidades**: Modelos de negocio puros sin dependencias externas
- **Repositorios**: Interfaces que definen contratos para acceso a datos
- **Reglas de negocio**: Lógica fundamental del dominio

#### 2. **Capa de Aplicación** (Application Layer)
- **Casos de Uso**: Implementan la lógica de negocio específica
- **Servicios**: Orquestan operaciones entre entidades
- No depende de frameworks externos

#### 3. **Capa de Infraestructura** (Infrastructure Layer)
- **Implementaciones de Repositorios**: Acceso real a base de datos
- **Servicios Externos**: JWT, encriptación, etc.
- **Configuraciones**: Base de datos, seguridad

#### 4. **Capa de Presentación** (Presentation Layer)
- **Controladores**: Manejan requests/responses HTTP
- **Rutas**: Definición de endpoints
- **Middlewares**: Autenticación, validación, etc.

### Flujo de Datos

```
Request → Routes → Controllers → Use Cases → Repositories → Database
                                     ↓
                                 Entities
                                     ↓
Response ← Controllers ← Use Cases ← Domain Models
```

### Principios Aplicados

- **Dependency Inversion**: Las capas externas dependen de las internas
- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Abierto para extensión, cerrado para modificación
- **Separation of Concerns**: Separación clara entre capas

## 🚀 Características

- ✅ Clean Architecture
- ✅ Autenticación JWT
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Base de datos PostgreSQL
- ✅ Gestión de usuarios (registro, login)
- ✅ Middleware de autenticación
- ✅ Manejo de errores
- ✅ CORS configurado

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/jesebe4991/creditos-backend.git
cd creditos-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=creditos_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu-clave-secreta-segura
JWT_EXPIRES_IN=24h
```

4. **Crear la base de datos**
```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE creditos_db;
```

Las tablas se crearán automáticamente al iniciar la aplicación.

## 🎯 Uso

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "createdAt": "2025-10-21T...",
      "updatedAt": "2025-10-21T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com",
      "name": "Nombre Usuario",
      "createdAt": "2025-10-21T...",
      "updatedAt": "2025-10-21T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener Perfil (Protegido)
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@example.com"
    }
  }
}
```

### Health Check
```http
GET /health
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-21T..."
}
```

## 🔒 Seguridad

- Las contraseñas se encriptan usando **bcrypt** con 10 salt rounds
- Los tokens JWT expiran en 24 horas (configurable)
- Las rutas protegidas requieren token JWT válido
- Validación de formato de email
- Contraseñas deben tener mínimo 6 caracteres

## 🗄️ Base de Datos

### Modelo de Datos

#### Tabla: users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | Identificador único (Primary Key) |
| email | VARCHAR(255) | Email del usuario (Único) |
| password | VARCHAR(255) | Contraseña encriptada |
| name | VARCHAR(255) | Nombre del usuario |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Fecha de última actualización |

### Índices
- `idx_users_email`: Índice en el campo email para búsquedas rápidas

## 🛠️ Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **PostgreSQL**: Base de datos relacional
- **pg**: Cliente de PostgreSQL para Node.js
- **jsonwebtoken**: Generación y verificación de JWT
- **bcrypt**: Encriptación de contraseñas
- **dotenv**: Gestión de variables de entorno
- **cors**: Habilitación de CORS
- **nodemon**: Hot reload en desarrollo

## 📝 Estructura del Proyecto

```
creditos-backend/
├── src/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── presentation/
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contribución

Este es un proyecto de práctica empresarial 2025.

## 📄 Licencia

ISC

## 👤 Autor

Proyecto de práctica empresarial 2025

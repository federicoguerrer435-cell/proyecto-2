# 🏦 Créditos Backend - Plataforma de Créditos Rápidos

Backend completo de plataforma de créditos desarrollado con **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM** y **Clean Architecture**.

## 🌟 Características Principales

✅ **Clean Architecture** - Separación clara de responsabilidades  
✅ **Prisma ORM** - ORM moderno y type-safe  
✅ **JWT + Refresh Tokens** - Autenticación segura con tokens renovables  
✅ **Roles y Permisos Dinámicos** - Sistema completo de autorización  
✅ **WhatsApp Cloud API** - Notificaciones automáticas por WhatsApp  
✅ **Generación de PDFs** - Comprobantes de pago guardados como bytea  
✅ **Cron Jobs** - Recordatorios automáticos de pagos  
✅ **Validación Única de Crédito** - Un solo crédito activo por cliente  
✅ **Auditoría Completa** - Trazabilidad en todas las operaciones  
✅ **Paginación y Filtros** - En todos los endpoints de listado  

---

## 📋 Requisitos Previos

- **Node.js** v18+ 
- **PostgreSQL** v12+
- **npm** o **yarn**
- Cuenta de **WhatsApp Cloud API** (opcional para notificaciones)

---

## 🚀 Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/jesebe4991/creditos-backend.git
cd creditos-backend
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno

\`\`\`bash
cp .env.example .env
\`\`\`

Editar el archivo \`.env\` con tus configuraciones:

\`\`\`env
# APLICACIÓN
NODE_ENV=development
PORT=3000

# BASE DE DATOS
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/creditos_db

# AUTENTICACIÓN JWT
JWT_SECRET=tu-clave-secreta-muy-segura-cambiala-en-produccion
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION_DAYS=30

# WHATSAPP CLOUD API (Opcional)
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_ID=123456789012345
WHATSAPP_API_URL=https://graph.facebook.com/v18.0

# CONFIGURACIÓN GLOBAL
GLOBAL_INTEREST_RATE=0.20
CRON_SCHEDULE=0 8 * * *
\`\`\`

### 4. Crear la base de datos en PostgreSQL

\`\`\`bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE creditos_db;

# Salir
\\q
\`\`\`

### 5. Ejecutar migraciones de Prisma

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

Esto creará todas las tablas en la base de datos.

### 6. Ejecutar seed (datos iniciales)

\`\`\`bash
npm run prisma:seed
\`\`\`

Esto creará:
- ✅ Roles: ADMIN, COBRADOR
- ✅ Permisos (usuarios, clientes, créditos, pagos, reportes)
- ✅ Usuario administrador
  - **Email**: admin@creditos.com
  - **Password**: Admin123!
- ✅ Configuraciones globales

**⚠️ IMPORTANTE**: Cambiar la contraseña del admin después del primer login.

### 7. Generar Prisma Client

\`\`\`bash
npx prisma generate
\`\`\`

---

## 🎯 Ejecución

### Modo Desarrollo

\`\`\`bash
npm run dev
\`\`\`

El servidor estará disponible en \`http://localhost:3000\`

### Modo Producción

\`\`\`bash
npm start
\`\`\`

### Prisma Studio (Interfaz visual de BD)

\`\`\`bash
npm run prisma:studio
\`\`\`

---

## 📡 API Endpoints

### 🔐 Autenticación

#### Login
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@creditos.com",
  "password": "Admin123!"
}
\`\`\`

**Respuesta (200)**:
\`\`\`json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@creditos.com",
      "nombre": "Administrador",
      "roles": ["ADMIN"],
      "permissions": [...]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
\`\`\`

#### Refresh Token
\`\`\`http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
\`\`\`

#### Logout
\`\`\`http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
\`\`\`

#### Registrar Usuario (Solo Admin)
\`\`\`http
POST /api/auth/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "nombre": "Juan Cobrador",
  "email": "cobrador@creditos.com",
  "password": "password123",
  "telefono": "1234567890",
  "roleId": 2
}
\`\`\`

#### Obtener Perfil
\`\`\`http
GET /api/auth/profile
Authorization: Bearer {accessToken}
\`\`\`

### 📝 Endpoints Pendientes de Implementación

Los siguientes endpoints están diseñados pero requieren implementación completa:

- **Usuarios**: \`/api/users\` (CRUD + roles)
- **Clientes**: \`/api/clientes\` (CRUD + búsqueda)
- **Créditos**: \`/api/creditos\` (CRUD + aprobar/rechazar)
- **Pagos**: \`/api/pagos\` (Crear pago con PDF + WhatsApp)
- **Tickets**: \`/api/tickets\` (Descargar PDF)
- **Notificaciones**: \`/api/notificaciones\` (Historial + envío manual)
- **Dashboard**: \`/api/dashboard/metrics\` (Métricas calculadas)
- **Reportes**: \`/api/reports/creditos\` (Reportes filtrados)
- **Búsquedas**: \`/api/search/creditos\`, \`/api/search/clientes\`

---

## 🗄️ Modelo de Base de Datos

### Tablas Principales

- **users** - Usuarios del sistema (admin, cobradores)
- **roles** - Roles (ADMIN, COBRADOR)
- **permissions** - Permisos granulares
- **role_permissions** - Relación roles-permisos
- **user_roles** - Relación usuarios-roles
- **clients** - Clientes que solicitan créditos
- **credits** - Créditos otorgados
- **payments** - Pagos realizados
- **tickets** - Comprobantes de pago (con PDF en bytea)
- **notifications** - Historial de notificaciones
- **refresh_tokens** - Tokens de renovación
- **config** - Configuraciones globales

### Estados de Crédito

- \`PENDIENTE\` - Crédito creado, pendiente de aprobación
- \`ACTIVO\` - Crédito aprobado y activo
- \`PAGADO\` - Crédito completamente pagado
- \`INCUMPLIDO\` - Crédito vencido sin pagar
- \`RENOVADO\` - Crédito renovado
- \`RECHAZADO\` - Crédito rechazado

### Métodos de Pago

- \`EFECTIVO\`
- \`TRANSFERENCIA\`
- \`CHEQUE\`
- \`TARJETA\`

---

## ⚙️ Funcionalidades Implementadas

### ✅ Autenticación Completa

- Login con JWT + Refresh Token
- Refresh token rotation (opcional)
- Logout con revocación de tokens
- Registro de usuarios (solo admin)

### ✅ Sistema de Permisos Dinámicos

- Roles: ADMIN, COBRADOR
- Permisos por módulo y acción
- Middleware \`authorize()\` para verificar permisos
- Middleware \`authorizeRole()\` para verificar roles

### ✅ Validación de Crédito Único

**Regla de negocio crítica**: Un cliente **NO** puede tener más de un crédito en estado \`ACTIVO\` o \`INCUMPLIDO\` al mismo tiempo.

\`\`\`javascript
// Validación en CreateCreditUseCase
const hasActiveCredit = await creditRepository.hasActiveCredit(clienteId);

if (hasActiveCredit) {
  throw new Error('El cliente ya tiene un crédito activo.');
}
\`\`\`

### ✅ Generación Automática de Tickets PDF

Al registrar un pago:
1. Se genera un PDF con los datos del comprobante
2. Se guarda el PDF como \`bytea\` en la tabla \`tickets\`
3. Se guarda metadata en texto plano/JSON
4. Se envía el comprobante por WhatsApp al cliente
5. Se registra la notificación en la base de datos

### ✅ Integración con WhatsApp Cloud API

- Envío de mensajes de texto
- Envío de plantillas (templates)
- Registro de respuestas de la API
- Manejo de errores (estado FALLIDO)

### ✅ Cron Job de Notificaciones

Se ejecuta diariamente a las 8 AM (configurable):

1. **Busca créditos próximos a vencer** (3 días antes)
   - Envía recordatorio por WhatsApp
   - Registra notificación tipo \`VENCIMIENTO_PROXIMO\`

2. **Busca créditos vencidos**
   - Envía alerta por WhatsApp
   - Actualiza estado a \`INCUMPLIDO\`
   - Registra notificación tipo \`CREDITO_VENCIDO\`

### ✅ Auditoría Completa

Todas las tablas principales tienen:
- \`created_at\` - Fecha de creación
- \`created_by\` - Usuario que creó
- \`updated_at\` - Fecha de última actualización
- \`updated_by\` - Usuario que actualizó

### ✅ Paginación Estandarizada

Respuesta de endpoints list:

\`\`\`json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
\`\`\`

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | v18+ | Runtime |
| Express | ^5.1.0 | Framework web |
| Prisma | ^6.2.0 | ORM |
| PostgreSQL | v12+ | Base de datos |
| JWT | ^9.0.2 | Autenticación |
| bcrypt | ^6.0.0 | Hash de contraseñas |
| node-cron | ^3.0.3 | Tareas programadas |
| pdfkit | ^0.15.2 | Generación de PDFs |
| axios | ^1.7.9 | Cliente HTTP |
| express-validator | ^7.0.0 | Validación de entrada |

---

## 📁 Estructura del Proyecto

\`\`\`
creditos-backend/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   ├── seed.js                # Datos iniciales
│   └── migrations/            # Migraciones generadas
├── src/
│   ├── domain/
│   │   ├── entities/          # Entidades de negocio
│   │   └── repositories/      # Interfaces de repositorios
│   ├── application/
│   │   ├── use-cases/         # Casos de uso (lógica de negocio)
│   │   └── services/          # Servicios de aplicación
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prismaClient.js
│   │   ├── repositories/      # Implementaciones con Prisma
│   │   ├── security/          # JWT, Password hashing
│   │   └── integrations/      # WhatsApp, PDF, Email
│   ├── presentation/
│   │   ├── controllers/       # Controladores HTTP
│   │   ├── middlewares/       # Auth, validación, errores
│   │   └── routes/            # Definición de rutas
│   ├── cron/                  # Jobs programados
│   │   └── notificationsCron.js
│   ├── app.js                 # Configuración de Express
│   └── server.js              # Punto de entrada
├── .env.example               # Variables de entorno
├── .gitignore
├── package.json
└── README.md
\`\`\`

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ JWT con expiración configurable (default: 15 minutos)
- ✅ Refresh tokens persistidos en BD con expiración (default: 30 días)
- ✅ Refresh tokens revocables
- ✅ Validación de entrada con express-validator
- ✅ Autorización basada en roles y permisos
- ✅ Manejo global de errores sin exponer detalles en producción
- ✅ CORS habilitado

---

## 📊 Comandos Útiles

\`\`\`bash
# Desarrollo
npm run dev                    # Iniciar en modo desarrollo

# Prisma
npm run prisma:generate        # Generar Prisma Client
npm run prisma:migrate         # Crear y aplicar migración
npm run prisma:studio          # Abrir Prisma Studio
npm run prisma:seed            # Ejecutar seed

# Producción
npm start                      # Iniciar en modo producción
\`\`\`

---

## 🐛 Manejo de Errores

Respuestas de error estandarizadas:

\`\`\`json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "code": "CODIGO_ERROR",
  "field": "campo" // (opcional, en errores de validación)
}
\`\`\`

### Códigos de Error

- \`VALIDATION_ERROR\` - Error de validación de entrada
- \`UNAUTHORIZED\` - No autenticado
- \`FORBIDDEN\` - No tiene permisos
- \`NOT_FOUND\` - Recurso no encontrado
- \`DUPLICATE_ENTRY\` - Registro duplicado (constraint único)
- \`INVALID_REFERENCE\` - Referencia inválida (foreign key)
- \`DATABASE_ERROR\` - Error de base de datos
- \`INTERNAL_ERROR\` - Error interno del servidor

---

## 🧪 Testing

> ⚠️ Tests no implementados en esta versión (solo estructura funcional)

---

## 📝 Notas Importantes

### Cambiar Contraseña del Admin

Después del primer login, cambiar la contraseña por defecto:

1. Login con \`admin@creditos.com\` / \`Admin123!\`
2. Implementar endpoint \`PUT /api/users/:id/password\`
3. Actualizar contraseña

### WhatsApp Cloud API

Para habilitar notificaciones por WhatsApp:

1. Crear cuenta en [Meta for Developers](https://developers.facebook.com/)
2. Configurar WhatsApp Business API
3. Obtener \`WHATSAPP_TOKEN\` y \`WHATSAPP_PHONE_ID\`
4. Agregar en \`.env\`

Si no configuras WhatsApp, los mensajes no se enviarán pero el sistema funcionará normalmente.

### Cron Job

El cron job se ejecuta según \`CRON_SCHEDULE\` en \`.env\`:

- Default: \`0 8 * * *\` (8 AM todos los días)
- Formato: minuto hora día mes día-semana
- Ejemplo para cada 30 min: \`*/30 * * * *\`

---

## 🤝 Contribución

Este es un proyecto de práctica empresarial 2025.

---

## 📄 Licencia

ISC

---

## 👤 Autor

Proyecto de práctica empresarial 2025  
Repository: [jesebe4991/creditos-backend](https://github.com/jesebe4991/creditos-backend)

---

## 🎯 Próximos Pasos (TODO)

- [ ] Implementar todos los endpoints REST (usuarios, clientes, créditos, pagos)
- [ ] Agregar tests unitarios e integración
- [ ] Implementar paginación helper reutilizable
- [ ] Agregar documentación Swagger/OpenAPI
- [ ] Implementar rate limiting
- [ ] Agregar logs estructurados (Winston/Pino)
- [ ] Dockerizar la aplicación
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo y alertas

---

**¡Proyecto listo para desarrollo! 🚀**

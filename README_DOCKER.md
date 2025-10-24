# 🐳 Docker - Guía para Desarrolladores

Esta guía te ayudará a levantar el entorno de desarrollo con Docker para el proyecto Créditos Backend.

## 📋 Requisitos Previos

- **Docker Desktop** instalado
  - Windows: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  - Mac: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
  - Linux: [Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (incluido en Docker Desktop)

### Verificar instalación

```bash
docker --version
docker-compose --version
```

---

## 🚀 Inicio Rápido

### 1. Levantar los contenedores

```bash
# Levantar PostgreSQL + pgAdmin
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado de contenedores
docker-compose ps
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.docker .env

# O en Windows PowerShell
Copy-Item .env.docker .env
```

El archivo `.env` ya está configurado para usar la base de datos Docker:

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/creditos_db
```

### 3. Instalar dependencias del proyecto

```bash
npm install
```

### 4. Generar Prisma Client

```bash
npx prisma generate
```

### 5. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

### 6. Cargar datos iniciales (seed)

```bash
npm run prisma:seed
```

Este comando crea:
- ✅ Usuario admin: `admin@creditos.com` / `Admin123!`
- ✅ Roles: ADMIN, COBRADOR
- ✅ Permisos del sistema
- ✅ Configuraciones globales

### 7. Iniciar el servidor

```bash
npm run dev
```

El servidor estará disponible en: http://localhost:3000

---

## 🗄️ Servicios Disponibles

### PostgreSQL Database

- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: postgres123
- **Base de datos**: creditos_db

**Connection String:**
```
postgresql://postgres:postgres123@localhost:5432/creditos_db
```

### pgAdmin (Interfaz Web)

Interfaz gráfica para administrar PostgreSQL.

- **URL**: http://localhost:5050
- **Email**: admin@creditos.com
- **Contraseña**: admin123

#### Conectar pgAdmin a PostgreSQL:

1. Abrir http://localhost:5050
2. Login con las credenciales
3. Click derecho en "Servers" → "Register" → "Server"
4. Pestaña "General":
   - Name: `Creditos DB`
5. Pestaña "Connection":
   - Host: `postgres` (nombre del contenedor)
   - Port: `5432`
   - Database: `creditos_db`
   - Username: `postgres`
   - Password: `postgres123`
6. Guardar

---

## 🎯 Comandos Docker

### Gestión de Contenedores

```bash
# Levantar contenedores
docker-compose up -d

# Detener contenedores
docker-compose stop

# Iniciar contenedores detenidos
docker-compose start

# Reiniciar contenedores
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (⚠️ ELIMINA DATOS)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f postgres

# Ver estado de contenedores
docker-compose ps
```

### Gestión de Volúmenes

```bash
# Listar volúmenes
docker volume ls

# Ver detalles del volumen de PostgreSQL
docker volume inspect creditos-backend_postgres_data

# Eliminar volúmenes no utilizados
docker volume prune
```

### Acceso Directo al Contenedor

```bash
# Conectarse a PostgreSQL desde la terminal
docker exec -it creditos_postgres psql -U postgres -d creditos_db

# Acceder al shell del contenedor
docker exec -it creditos_postgres sh

# Dentro del contenedor, puedes usar psql
psql -U postgres -d creditos_db
```

### Consultas SQL Directas

```bash
# Ver todas las tablas
docker exec -it creditos_postgres psql -U postgres -d creditos_db -c "\dt"

# Ver usuarios en la BD
docker exec -it creditos_postgres psql -U postgres -d creditos_db -c "SELECT id, nombre, email FROM users;"

# Backup de la base de datos
docker exec -t creditos_postgres pg_dump -U postgres creditos_db > backup.sql

# Restaurar backup
docker exec -i creditos_postgres psql -U postgres -d creditos_db < backup.sql
```

---

## 🔄 Workflow de Desarrollo

### Inicio del día

```bash
# 1. Levantar contenedores
docker-compose up -d

# 2. Verificar que estén corriendo
docker-compose ps

# 3. Iniciar el proyecto
npm run dev
```

### Durante el desarrollo

```bash
# Ver logs de PostgreSQL si hay errores
docker-compose logs -f postgres

# Explorar la BD con Prisma Studio
npm run prisma:studio

# O usar pgAdmin en http://localhost:5050
```

### Fin del día

```bash
# Detener el servidor (Ctrl + C)

# Detener contenedores (los datos persisten)
docker-compose stop

# O dejar corriendo (recomendado)
# Los contenedores se reiniciarán automáticamente al reiniciar Docker
```

---

## 📊 Prisma con Docker

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (⚠️ ELIMINA TODOS LOS DATOS)
npx prisma migrate reset
```

### Prisma Studio

Interfaz visual para ver y editar datos:

```bash
npm run prisma:studio
```

Abre en: http://localhost:5555

---

## 🛠️ Troubleshooting

### Puerto 5432 ya en uso

**Error**: `bind: address already in use`

**Solución 1**: Detener PostgreSQL local
```bash
# Windows
net stop postgresql-x64-12

# Linux/Mac
sudo service postgresql stop
```

**Solución 2**: Cambiar el puerto en docker-compose.yml
```yaml
ports:
  - "5433:5432"  # Usar puerto 5433 en lugar de 5432
```

Y actualizar DATABASE_URL en `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/creditos_db
```

### No se puede conectar a la base de datos

**Verificar que el contenedor esté corriendo:**
```bash
docker-compose ps
```

**Ver logs del contenedor:**
```bash
docker-compose logs postgres
```

**Verificar health check:**
```bash
docker inspect creditos_postgres | grep Health
```

**Reiniciar contenedor:**
```bash
docker-compose restart postgres
```

### Eliminar todo y empezar de cero

```bash
# 1. Detener y eliminar contenedores y volúmenes
docker-compose down -v

# 2. Eliminar imagen de PostgreSQL
docker rmi postgres:15-alpine

# 3. Levantar de nuevo
docker-compose up -d

# 4. Ejecutar migraciones y seed
npx prisma migrate dev --name init
npm run prisma:seed
```

### Error de permisos en volúmenes (Linux)

Si tienes problemas de permisos:

```bash
# Dar permisos al directorio de datos
sudo chown -R $USER:$USER ./

# O ejecutar docker-compose con sudo
sudo docker-compose up -d
```

### Volúmenes no persisten los datos

**Verificar que el volumen existe:**
```bash
docker volume ls | grep postgres
```

**Ver configuración del volumen:**
```bash
docker volume inspect creditos-backend_postgres_data
```

---

## 🔒 Seguridad

### Para Producción

⚠️ **NO uses estas credenciales en producción**

Cambiar en docker-compose.yml:
```yaml
environment:
  POSTGRES_USER: ${DB_USER}
  POSTGRES_PASSWORD: ${DB_PASSWORD}
  POSTGRES_DB: ${DB_NAME}
```

Y usar variables de entorno seguras.

### Backup Automático

Crear script de backup:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker exec -t creditos_postgres pg_dump -U postgres creditos_db > "backup_$DATE.sql"
echo "Backup creado: backup_$DATE.sql"
```

---

## 📈 Monitoreo

### Ver uso de recursos

```bash
# CPU y memoria de contenedores
docker stats

# Solo PostgreSQL
docker stats creditos_postgres
```

### Ver tamaño de la base de datos

```bash
docker exec -it creditos_postgres psql -U postgres -d creditos_db -c "SELECT pg_size_pretty(pg_database_size('creditos_db'));"
```

---

## 🎯 Siguientes Pasos

Una vez que tengas Docker corriendo:

1. ✅ Contenedores levantados con `docker-compose up -d`
2. ✅ Migraciones aplicadas con `npx prisma migrate dev`
3. ✅ Seed ejecutado con `npm run prisma:seed`
4. ✅ Servidor corriendo con `npm run dev`

Puedes:
- Probar el login: http://localhost:3000/api/auth/login
- Ver la BD en pgAdmin: http://localhost:5050
- Usar Prisma Studio: `npm run prisma:studio`

---

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

## ✅ Checklist de Verificación

- [ ] Docker Desktop instalado y corriendo
- [ ] Contenedores levantados: `docker-compose ps`
- [ ] PostgreSQL respondiendo: `docker exec -it creditos_postgres psql -U postgres -c "SELECT 1"`
- [ ] `.env` configurado con DATABASE_URL correcto
- [ ] Prisma Client generado: `npx prisma generate`
- [ ] Migraciones aplicadas: `npx prisma migrate dev`
- [ ] Seed ejecutado: `npm run prisma:seed`
- [ ] Servidor iniciado: `npm run dev`
- [ ] Health check responde: http://localhost:3000/health

---

**¡Entorno Docker listo para desarrollo!** 🐳

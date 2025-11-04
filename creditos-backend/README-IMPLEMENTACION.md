# 📋 Implementación: Flujo de Aprobación y Rechazo de Créditos

## Issue #14 - Endpoints para Aprobar/Rechazar Créditos

---

## 📦 Archivos Creados

### 1. **Caso de Uso**
```
src/application/use-cases/ManageCreditStatusUseCase.js
```
- Maneja la aprobación y rechazo de créditos
- Validaciones de estado
- Envío de notificaciones por WhatsApp
- Registro de auditoría

### 2. **Controlador**
```
src/presentation/controllers/CreditsController.js
```
- Endpoints REST para aprobar/rechazar
- Validaciones con express-validator
- Manejo de errores

### 3. **Rutas**
```
src/presentation/routes/creditRoutes.js
```
- Definición de endpoints
- Middlewares de autenticación y autorización
- Documentación de rutas

### 4. **Tests**
```
credits-tests.http
```
- Pruebas completas de los endpoints
- Casos de éxito y error
- Ejemplos de uso

---

## 🚀 Instalación

### 1. Copiar los archivos a tu proyecto

```bash
# Caso de Uso
cp ManageCreditStatusUseCase.js src/application/use-cases/

# Controlador
cp CreditsController.js src/presentation/controllers/

# Rutas
cp creditRoutes.js src/presentation/routes/
```

### 2. Registrar las rutas en `app.js`

Abre el archivo `src/app.js` y agrega la importación de las rutas de créditos:

```javascript
// Importar rutas de créditos
const creditRoutes = require('./presentation/routes/creditRoutes');

// En el método configureRoutes(), agregar:
this.app.use('/api/credits', creditRoutes);
```

Debería quedar así:

```javascript
configureRoutes() {
  // Health check endpoint
  this.app.get('/health', (req, res) => {
    // ... código existente ...
  });

  // API routes
  this.app.use('/api/auth', authRoutes);
  this.app.use('/api/users', userRoutes);
  this.app.use('/api/credits', creditRoutes); // ← AGREGAR ESTA LÍNEA

  // 404 handler
  this.app.use(notFound);

  // Global error handler
  this.app.use(errorHandler);
}
```

### 3. Verificar que los permisos existan en la BD

Los siguientes permisos ya deberían estar en tu base de datos (del seed inicial):

- `credits.read` - Ver créditos
- `credits.create` - Crear créditos
- `credits.approve` - Aprobar créditos
- `credits.reject` - Rechazar créditos

Si no existen, agrégalos al archivo `prisma/seed.js`:

```javascript
const permissions = [
  // ... permisos existentes ...
  
  // Créditos
  { name: 'credits.approve', module: 'credits', action: 'approve', description: 'Aprobar créditos' },
  { name: 'credits.reject', module: 'credits', action: 'reject', description: 'Rechazar créditos' },
];
```

Luego ejecuta:

```bash
npm run prisma:seed
```

---

## 🧪 Probar los Endpoints

### 1. Asegúrate de que el servidor esté corriendo

```bash
npm run dev
```

### 2. Opciones para probar:

#### Opción A: Usar el archivo `credits-tests.http` (Recomendado)

Si usas VS Code con la extensión **REST Client**:

1. Abre el archivo `credits-tests.http`
2. Haz clic en "Send Request" sobre cada endpoint
3. Sigue el orden de las pruebas

#### Opción B: Usar cURL

```bash
# 1. Login para obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@creditos.com",
    "password": "Admin123!"
  }'

# 2. Crear un crédito (guarda el ID que te devuelva)
curl -X POST http://localhost:3000/api/credits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "clienteId": 1,
    "montoPrincipal": 5000,
    "cuotas": 12
  }'

# 3. Aprobar el crédito
curl -X POST http://localhost:3000/api/credits/1/approve \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# 4. Rechazar un crédito con motivo
curl -X POST http://localhost:3000/api/credits/2/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "motivo": "Documentación incompleta"
  }'
```

#### Opción C: Usar Postman

Importa la colección desde el archivo `credits-tests.http` o crea manualmente las peticiones.

---

## 📝 Endpoints Disponibles

### 1. **Aprobar Crédito**

```http
POST /api/credits/:id/approve
```

**Headers:**
- `Authorization: Bearer {token}`

**Permisos requeridos:** `credits.approve`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Crédito aprobado exitosamente",
  "data": {
    "credit": {
      "id": 1,
      "numeroCredito": "CRE-2025-000001",
      "estado": "ACTIVO",
      "montoPrincipal": "5000.00",
      "cuotas": 12,
      "fechaVencimiento": "2026-01-03T05:00:00.000Z",
      "updatedAt": "2025-11-03T15:30:00.000Z"
    },
    "notificacionEnviada": true
  }
}
```

**Errores comunes:**
- `400` - El crédito no está en estado PENDIENTE
- `400` - El cliente ya tiene un crédito activo
- `404` - Crédito no encontrado
- `401` - No autenticado
- `403` - Sin permisos

---

### 2. **Rechazar Crédito**

```http
POST /api/credits/:id/reject
```

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body (opcional):**
```json
{
  "motivo": "Documentación incompleta"
}
```

**Permisos requeridos:** `credits.reject`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Crédito rechazado exitosamente",
  "data": {
    "credit": {
      "id": 2,
      "numeroCredito": "CRE-2025-000002",
      "estado": "RECHAZADO",
      "montoPrincipal": "3000.00",
      "motivo": "Documentación incompleta",
      "updatedAt": "2025-11-03T15:35:00.000Z"
    },
    "notificacionEnviada": true
  }
}
```

---

### 3. **Listar Créditos**

```http
GET /api/credits?page=1&limit=10&estado=PENDIENTE
```

**Query params:**
- `page` (opcional) - Número de página, default: 1
- `limit` (opcional) - Registros por página, default: 10
- `estado` (opcional) - Filtrar por estado: PENDIENTE, ACTIVO, RECHAZADO, etc.
- `clienteId` (opcional) - Filtrar por cliente

---

### 4. **Ver Detalle de Crédito**

```http
GET /api/credits/:id
```

Retorna información completa del crédito incluyendo:
- Monto total a pagar
- Valor de cada cuota
- Total de intereses
- Total pagado
- Saldo pendiente

---

## ✅ Validaciones Implementadas

### Al Aprobar:
1. ✅ Crédito debe existir
2. ✅ Crédito debe estar en estado `PENDIENTE`
3. ✅ Cliente no debe tener otro crédito `ACTIVO` o `INCUMPLIDO`
4. ✅ Usuario debe tener permiso `credits.approve`

### Al Rechazar:
1. ✅ Crédito debe existir
2. ✅ Crédito debe estar en estado `PENDIENTE`
3. ✅ Motivo opcional (10-500 caracteres si se proporciona)
4. ✅ Usuario debe tener permiso `credits.reject`

---

## 🔔 Notificaciones

Cuando se aprueba o rechaza un crédito:

1. ✅ Se envía mensaje por **WhatsApp** al cliente (si está configurado)
2. ✅ Se registra en la tabla `notifications`
3. ✅ Se guarda el response de la API de WhatsApp

**Mensajes enviados:**

### Aprobación:
```
¡CRÉDITO APROBADO! ✅

Estimado/a [Nombre Cliente],

Su crédito ha sido APROBADO.

📋 Detalles del crédito:
• Número: CRE-2025-000001
• Monto: $5000.00
• Tasa de interés: 20.00%
• Total a pagar: $6000.00
• Número de cuotas: 12
• Valor por cuota: $500.00
• Fecha de vencimiento: 03/01/2026

¡Gracias por su confianza!
```

### Rechazo:
```
CRÉDITO RECHAZADO ❌

Estimado/a [Nombre Cliente],

Lamentamos informarle que su crédito N° CRE-2025-000002 
ha sido RECHAZADO.

Motivo: Documentación incompleta

📋 Datos del crédito:
• Número: CRE-2025-000002
• Monto solicitado: $3000.00
• Fecha de solicitud: 03/11/2025

Para más información, por favor comuníquese con nosotros.

Gracias por su comprensión.
```

---

## 🎯 Auditoría

Cada acción registra:
- ✅ `updated_by` - ID del usuario que aprobó/rechazó
- ✅ `updated_at` - Timestamp de la acción
- ✅ Registro en tabla `notifications` con:
  - Tipo de notificación
  - Mensaje enviado
  - Estado de envío
  - Response de la API

---

## 🐛 Solución de Problemas

### Error: "No se puede aprobar un crédito en estado X"
**Solución:** Solo se pueden aprobar créditos en estado `PENDIENTE`. Verifica el estado actual del crédito.

### Error: "El cliente ya tiene un crédito activo"
**Solución:** El cliente solo puede tener UN crédito activo a la vez. Espera a que se pague o rechace el crédito actual.

### Error: "No tiene permisos para realizar esta acción"
**Solución:** Tu usuario necesita los permisos `credits.approve` o `credits.reject`. Contacta al administrador.

### Notificación no se envía
**Solución:** Verifica la configuración de WhatsApp en el `.env`:
```env
WHATSAPP_TOKEN=tu_token
WHATSAPP_PHONE_ID=tu_phone_id
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
```

---

## 📊 Flujo Completo

```
1. CREAR CRÉDITO (estado: PENDIENTE)
   ↓
2. REVISAR SOLICITUD
   ↓
   ├─→ APROBAR → Estado: ACTIVO → Notificación WhatsApp
   │                                    ↓
   │                            Cliente puede recibir el dinero
   │
   └─→ RECHAZAR → Estado: RECHAZADO → Notificación WhatsApp
                                           ↓
                                   Fin del proceso
```

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Aprobación exitosa
1. Crear crédito para cliente sin créditos activos
2. Aprobar el crédito
3. Verificar estado = ACTIVO
4. Verificar notificación enviada

### ✅ Caso 2: Rechazo con motivo
1. Crear crédito
2. Rechazar con motivo detallado
3. Verificar estado = RECHAZADO
4. Verificar notificación con motivo

### ✅ Caso 3: Validación de crédito activo
1. Crear y aprobar crédito para cliente A
2. Intentar crear y aprobar otro crédito para cliente A
3. Debe fallar con error "cliente ya tiene crédito activo"

### ✅ Caso 4: Validación de estado
1. Crear y aprobar crédito
2. Intentar aprobar nuevamente el mismo crédito
3. Debe fallar con error "no se puede aprobar crédito en estado ACTIVO"

---

## 📞 Soporte

Si tienes problemas con la implementación:

1. Verifica que todos los archivos estén en las rutas correctas
2. Verifica que las rutas estén registradas en `app.js`
3. Verifica que los permisos existan en la base de datos
4. Revisa los logs del servidor para ver errores detallados
5. Usa el archivo `credits-tests.http` para probar paso a paso

---

## ✅ Checklist de Implementación

- [ ] Copiar `ManageCreditStatusUseCase.js` a `src/application/use-cases/`
- [ ] Copiar `CreditsController.js` a `src/presentation/controllers/`
- [ ] Copiar `creditRoutes.js` a `src/presentation/routes/`
- [ ] Registrar rutas en `src/app.js`
- [ ] Verificar permisos en base de datos
- [ ] Reiniciar servidor
- [ ] Probar endpoint de aprobación
- [ ] Probar endpoint de rechazo
- [ ] Verificar notificaciones
- [ ] Verificar auditoría (updated_by, updated_at)

---

**¡Implementación completa! 🎉**

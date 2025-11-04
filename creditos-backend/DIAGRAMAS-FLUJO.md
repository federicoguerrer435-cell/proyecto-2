# 📊 Diagramas de Flujo - Aprobación y Rechazo de Créditos

## Flujo General del Sistema

```mermaid
graph TD
    A[Cliente solicita crédito] --> B[Crédito creado<br/>Estado: PENDIENTE]
    B --> C{Revisar solicitud}
    
    C -->|Aprobar| D[Validar que cliente<br/>NO tenga crédito activo]
    D -->|✅ OK| E[Cambiar estado a ACTIVO]
    D -->|❌ Error| F[Rechazar con error:<br/>'Cliente ya tiene crédito activo']
    
    C -->|Rechazar| G[Cambiar estado a RECHAZADO]
    
    E --> H[Enviar notificación<br/>WhatsApp - APROBADO]
    G --> I[Enviar notificación<br/>WhatsApp - RECHAZADO]
    
    H --> J[Registrar en tabla<br/>notifications]
    I --> J
    
    J --> K[Registrar auditoría<br/>updated_by, updated_at]
    
    K --> L[✅ Proceso completado]
    F --> M[❌ Proceso fallido]
```

---

## Flujo de Aprobación Detallado

```mermaid
sequenceDiagram
    participant U as Usuario Admin
    participant C as Controller
    participant UC as UseCase
    participant R as Repository
    participant W as WhatsApp Service
    participant DB as Database
    
    U->>C: POST /credits/:id/approve
    C->>C: Validar autenticación
    C->>C: Verificar permiso 'credits.approve'
    C->>UC: approve(creditId, userId)
    
    UC->>R: findById(creditId)
    R->>DB: SELECT * FROM credits
    DB-->>R: Credit data
    R-->>UC: Credit object
    
    UC->>UC: Validar estado = PENDIENTE
    
    UC->>R: hasActiveCredit(clienteId)
    R->>DB: SELECT COUNT(*)<br/>WHERE estado IN ('ACTIVO','INCUMPLIDO')
    DB-->>R: Count
    R-->>UC: Boolean
    
    alt Cliente ya tiene crédito activo
        UC-->>C: Error: Cliente ya tiene crédito activo
        C-->>U: 400 Bad Request
    else OK - Sin créditos activos
        UC->>R: update(creditId, {estado: 'ACTIVO'})
        R->>DB: UPDATE credits SET estado='ACTIVO'
        DB-->>R: Updated credit
        R-->>UC: Updated credit
        
        UC->>W: sendTextMessage(telefono, mensaje)
        W->>W: Enviar a WhatsApp API
        W-->>UC: Response {success: true}
        
        UC->>DB: INSERT INTO notifications
        DB-->>UC: Notification created
        
        UC-->>C: {credit, notificacionEnviada: true}
        C-->>U: 200 OK + Credit data
    end
```

---

## Flujo de Rechazo Detallado

```mermaid
sequenceDiagram
    participant U as Usuario Admin
    participant C as Controller
    participant UC as UseCase
    participant R as Repository
    participant W as WhatsApp Service
    participant DB as Database
    
    U->>C: POST /credits/:id/reject<br/>{motivo: "Docs incompletas"}
    C->>C: Validar autenticación
    C->>C: Verificar permiso 'credits.reject'
    C->>C: Validar motivo (opcional, 10-500 chars)
    C->>UC: reject(creditId, userId, motivo)
    
    UC->>R: findById(creditId)
    R->>DB: SELECT * FROM credits
    DB-->>R: Credit data
    R-->>UC: Credit object
    
    UC->>UC: Validar estado = PENDIENTE
    
    alt Estado != PENDIENTE
        UC-->>C: Error: Solo se pueden rechazar créditos PENDIENTES
        C-->>U: 400 Bad Request
    else Estado = PENDIENTE
        UC->>R: update(creditId, {estado: 'RECHAZADO'})
        R->>DB: UPDATE credits SET estado='RECHAZADO'
        DB-->>R: Updated credit
        R-->>UC: Updated credit
        
        UC->>UC: Preparar mensaje con motivo
        
        UC->>W: sendTextMessage(telefono, mensaje)
        W->>W: Enviar a WhatsApp API
        W-->>UC: Response {success: true}
        
        UC->>DB: INSERT INTO notifications<br/>(tipo: CREDITO_RECHAZADO)
        DB-->>UC: Notification created
        
        UC-->>C: {credit, motivo, notificacionEnviada: true}
        C-->>U: 200 OK + Credit data + motivo
    end
```

---

## Estados del Crédito

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE: Crédito creado
    
    PENDIENTE --> ACTIVO: Aprobar
    PENDIENTE --> RECHAZADO: Rechazar
    
    ACTIVO --> PAGADO: Completar pagos
    ACTIVO --> INCUMPLIDO: Vencimiento sin pago
    ACTIVO --> RENOVADO: Renovar crédito
    
    RECHAZADO --> [*]: Fin
    PAGADO --> [*]: Fin
    INCUMPLIDO --> PAGADO: Pago tardío completo
    RENOVADO --> [*]: Fin
    
    note right of PENDIENTE
        Solo en este estado se puede
        aprobar o rechazar
    end note
    
    note right of ACTIVO
        Cliente debe pagar las cuotas.
        Solo puede tener UN crédito activo.
    end note
```

---

## Validación de Crédito Único por Cliente

```mermaid
graph TD
    A[Intentar aprobar crédito] --> B[Buscar créditos del cliente]
    B --> C{¿Tiene créditos en<br/>estado ACTIVO o INCUMPLIDO?}
    
    C -->|SÍ| D[❌ Rechazar aprobación<br/>Error: Cliente ya tiene crédito activo]
    C -->|NO| E[✅ Permitir aprobación]
    
    E --> F[Cambiar estado a ACTIVO]
    F --> G[Cliente ahora tiene 1 crédito activo]
    
    D --> H[El crédito permanece PENDIENTE<br/>o se puede RECHAZAR]
    
    style D fill:#f88,stroke:#f00
    style E fill:#8f8,stroke:#0f0
    style G fill:#ff9,stroke:#f90
```

---

## Proceso de Notificaciones

```mermaid
graph LR
    A[Acción realizada<br/>Aprobar/Rechazar] --> B[Obtener datos del cliente]
    B --> C[Generar mensaje personalizado]
    C --> D{WhatsApp configurado?}
    
    D -->|SÍ| E[Enviar mensaje<br/>por WhatsApp API]
    D -->|NO| F[Mock: Log del mensaje]
    
    E --> G{Envío exitoso?}
    F --> H[Estado: FALLIDO]
    
    G -->|SÍ| I[Estado: ENVIADO]
    G -->|NO| H
    
    I --> J[Registrar en tabla notifications<br/>con response de API]
    H --> J
    
    J --> K[✅ Notificación guardada]
    
    style I fill:#8f8,stroke:#0f0
    style H fill:#f88,stroke:#f00
```

---

## Arquitectura de Capas

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[creditRoutes.js] --> B[CreditsController.js]
    end
    
    subgraph "Application Layer"
        B --> C[ManageCreditStatusUseCase.js]
    end
    
    subgraph "Infrastructure Layer"
        C --> D[PrismaCreditRepository.js]
        C --> E[PrismaClientRepository.js]
        C --> F[whatsappService.js]
    end
    
    subgraph "Database"
        D --> G[(PostgreSQL + Prisma)]
        E --> G
    end
    
    subgraph "External APIs"
        F --> H[WhatsApp Cloud API]
    end
    
    style C fill:#bbf,stroke:#00f
    style G fill:#ff9,stroke:#f90
    style H fill:#9f9,stroke:#0f0
```

---

## Manejo de Errores

```mermaid
graph TD
    A[Request recibido] --> B{Autenticado?}
    B -->|NO| C[401 Unauthorized]
    B -->|SÍ| D{Tiene permisos?}
    
    D -->|NO| E[403 Forbidden]
    D -->|SÍ| F{Crédito existe?}
    
    F -->|NO| G[404 Not Found]
    F -->|SÍ| H{Estado = PENDIENTE?}
    
    H -->|NO| I[400 Bad Request<br/>'Estado inválido']
    H -->|SÍ| J{Cliente sin crédito activo?<br/>solo para APROBAR}
    
    J -->|NO| K[400 Bad Request<br/>'Cliente ya tiene crédito activo']
    J -->|SÍ| L[✅ Procesar acción]
    
    L --> M{Notificación exitosa?}
    M -->|SÍ| N[200 OK + notificacionEnviada: true]
    M -->|NO| O[200 OK + notificacionEnviada: false]
    
    style C fill:#f88
    style E fill:#f88
    style G fill:#f88
    style I fill:#f88
    style K fill:#f88
    style N fill:#8f8
    style O fill:#ff9
```

---

## Ejemplo de Datos - Antes y Después

### ANTES de Aprobar
```json
{
  "id": 1,
  "numeroCredito": "CRE-2025-000001",
  "clienteId": 1,
  "estado": "PENDIENTE",
  "montoPrincipal": 5000,
  "cuotas": 12,
  "created_by": 1,
  "updated_by": null,
  "created_at": "2025-11-03T10:00:00Z",
  "updated_at": "2025-11-03T10:00:00Z"
}
```

### DESPUÉS de Aprobar
```json
{
  "id": 1,
  "numeroCredito": "CRE-2025-000001",
  "clienteId": 1,
  "estado": "ACTIVO", // ← Cambió
  "montoPrincipal": 5000,
  "cuotas": 12,
  "created_by": 1,
  "updated_by": 2, // ← Usuario que aprobó
  "created_at": "2025-11-03T10:00:00Z",
  "updated_at": "2025-11-03T15:30:00Z" // ← Timestamp actualizado
}
```

### Nueva Notificación Creada
```json
{
  "id": 1,
  "clienteId": 1,
  "tipo": "CREDITO_APROBADO",
  "mensaje": "¡CRÉDITO APROBADO! ✅\n\nEstimado/a Juan Pérez...",
  "medio": "WHATSAPP",
  "estadoEnvio": "ENVIADO",
  "responseApi": "{\"success\": true, \"messageId\": \"wamid.xyz...\"}",
  "fechaEnvio": "2025-11-03T15:30:05Z",
  "created_at": "2025-11-03T15:30:05Z"
}
```

---

## Endpoints Resumidos

| Método | Endpoint | Acción | Estado Requerido | Permiso |
|--------|----------|--------|------------------|---------|
| POST | `/credits/:id/approve` | Aprobar | PENDIENTE | `credits.approve` |
| POST | `/credits/:id/reject` | Rechazar | PENDIENTE | `credits.reject` |
| GET | `/credits` | Listar | - | `credits.read` |
| GET | `/credits/:id` | Ver detalle | - | `credits.read` |
| POST | `/credits` | Crear | - | `credits.create` |

---

**Estos diagramas muestran visualmente cómo funciona toda la implementación.** 📊

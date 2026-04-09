# Documentación de Arquitectura
## AppRecetasSocial — Patrón MVC + Arquitectura por Capas

---

## Estructura Real del Proyecto

```
AppRecetasSocial/                    ← Raíz del monorepo
│
├── backend/                         ◄── SERVIDOR (Node.js + Express)
│   ├── controllers/                 ← Lógica de negocio (MVC: Controller)
│   │   ├── authController.js        ← Login, registro, MFA, tokens, logout
│   │   ├── userController.js        ← Contraseña, MFA toggle, sesiones, RBAC
│   │   └── recoveryController.js   ← Recuperación omnicanal (email, SMS, pregunta)
│   │
│   ├── middlewares/                 ← Capa de guardias (MVC: middleware)
│   │   ├── authMiddleware.js        ← Valida JWT + sesión activa en BD
│   │   └── roleMiddleware.js        ← Autorización por rol (RBAC)
│   │
│   ├── routes/                      ← Definición de endpoints (MVC: Router)
│   │   ├── authRoutes.js            ← /api/auth/* + rate limiter
│   │   ├── userRoutes.js            ← /api/user/* (todas protegidas)
│   │   └── recoveryRoutes.js        ← /api/recovery/*
│   │
│   ├── prisma/                      ← Capa de datos (MVC: Model)
│   │   ├── schema.prisma            ← Definición de modelos (Usuario, Sesion)
│   │   └── migrations/              ← Historial de cambios de esquema
│   │
│   ├── server.js                    ← Entry point: configura Express y monta rutas
│   ├── .env                         ← Variables de entorno (secrets, DATABASE_URL)
│   └── test-security.js             ← Suite de pruebas automatizadas E2E
│
├── src/                             ◄── CLIENTE (React + Vite)
│   ├── api/                         ← Capa de servicio HTTP del frontend
│   │   ├── userApi.js               ← fetchWithAuth + auto-refresh de token
│   │   ├── recoveryApi.js           ← Llamadas a /api/recovery/*
│   │   ├── recipeApi.js             ← Llamadas a recetas
│   │   └── mockDataApi.js           ← Datos simulados para comunidad
│   │
│   ├── hooks/                       ← Lógica reutilizable (Custom Hooks)
│   │   ├── useRecipes.js            ← Estado y CRUD de recetas
│   │   ├── useCommunityData.js      ← Datos de la comunidad
│   │   ├── usePolling.js            ← Verificación periódica de sesión activa
│   │   ├── useScrollAnimation.js    ← Animaciones on-scroll
│   │   └── useMountTransition.js    ← Transiciones de montaje de componentes
│   │
│   ├── components/                  ← Vistas y UI (MVC: View)
│   │   │── Auth
│   │   │   ├── Login.jsx            ← Formulario de login + flujo OTP (paso 1 y 2)
│   │   │   ├── Register.jsx         ← Registro con CAPTCHA matemático
│   │   │   └── ForgotPassword.jsx   ← Recuperación omnicanal (4 vectores)
│   │   │── Dashboard
│   │   │   ├── CommunityDashboard.jsx ← Feed de comunidad
│   │   │   ├── AdminDashboard.jsx   ← Panel de administración RBAC
│   │   │   ├── RecipeCard.jsx       ← Tarjeta de receta (botones según rol)
│   │   │   ├── RecipeForm.jsx       ← Modal de creación/edición
│   │   │   └── Feed.jsx             ← Contenedor de recetas del usuario
│   │   │── Settings
│   │   │   └── UserSettings.jsx     ← Configuración: contraseña, MFA, sesiones, tema
│   │   └── Shared
│   │       ├── Navbar.jsx           ← Navegación principal
│   │       ├── GlobalToast.jsx      ← Notificaciones globales (EventBus)
│   │       ├── FilterBar.jsx        ← Filtros y búsqueda
│   │       ├── DeleteModal.jsx      ← Modal de confirmación
│   │       └── MagneticButton.jsx   ← Componente de animación magnética
│   │
│   ├── utils/                       ← Utilidades transversales
│   │   ├── eventBus.js              ← Pub/Sub para comunicación entre componentes
│   │   ├── debounce.js              ← Control de frecuencia de eventos (búsqueda)
│   │   └── throttle.js              ← Control de frecuencia de eventos (scroll)
│   │
│   ├── App.jsx                      ← Compositor principal: enruta vistas, maneja auth
│   └── main.jsx                     ← Entry point React (monta <App />)
│
└── docs/
    └── documentacion.md             ← Documentación del proyecto
```

---

## Arquitectura: MVC en Backend

El backend sigue el patrón **Model – View – Controller** adaptado a APIs REST:

```
Request HTTP
     │
     ▼
 [Routes]          authRoutes.js / userRoutes.js / recoveryRoutes.js
     │              → Define URL y método HTTP
     │              → Aplica middlewares (rate limiter)
     ▼
 [Middleware]       authMiddleware.js / roleMiddleware.js
     │              → Verifica JWT firmado
     │              → Consulta sesión activa en BD
     │              → Verifica rol del usuario
     ▼
 [Controller]       authController.js / userController.js / recoveryController.js
     │              → Valida datos de entrada
     │              → Ejecuta lógica de negocio
     │              → Llama al Model (Prisma)
     ▼
 [Model]            Prisma Client → PostgreSQL
                    → schema.prisma define los modelos
                    → Genera queries SQL parametrizadas
                    → Retorna objetos tipados
     │
     └── Respuesta JSON al cliente
```

### Responsabilidades por capa

| Capa | Archivo(s) | Responsabilidad |
|---|---|---|
| **Router** | `*Routes.js` | Mapear URL → Controller. Aplicar guards de acceso |
| **Middleware** | `authMiddleware`, `roleMiddleware` | Autenticación y autorización transversal |
| **Controller** | `*Controller.js` | Orquestar la lógica de negocio de cada endpoint |
| **Model** | `schema.prisma` + Prisma Client | Representar y persistir entidades de datos |

---

## Arquitectura: Capas en Frontend

El frontend usa **React** con separación explícita en capas:

```
[App.jsx]           ← Orquestador central
    │                  Maneja: autenticación, rol, navegación, estado global
    │
    ├── [components/]  Vista pura (renderiza datos, emite eventos)
    │       └── Reciben props, llaman hooks y funciones del API
    │
    ├── [hooks/]       Lógica de negocio del cliente
    │       └── useRecipes, useCommunityData, usePolling, etc.
    │
    ├── [api/]         Capa de servicio HTTP
    │       └── fetchWithAuth: centraliza headers, auto-refresh de tokens,
    │           manejo de errores 401/403
    │
    └── [utils/]       Utilidades stateless
            └── eventBus (pub/sub), debounce, throttle
```

### El patrón `fetchWithAuth` — Refresh transparente

La función `fetchWithAuth` en `userApi.js` implementa renovación automática del Access Token. Es invisible para los componentes:

```javascript
// userApi.js – líneas 12-39
const fetchWithAuth = async (url, options = {}) => {
  let res = await fetch(url, { ...options, headers: getAuthHeaders(), credentials: 'include' });

  if (res.status === 401 || res.status === 403) {
    // Token expirado → solicitar nuevo usando la cookie refreshToken
    const refreshRes = await fetch(`${AUTH_URL}/refresh`, { method: 'POST', credentials: 'include' });
    const { accessToken } = await refreshRes.json();
    localStorage.setItem('token', accessToken);

    // Reintentar con el nuevo token
    res = await fetch(url, { ...options, headers: getAuthHeaders(), credentials: 'include' });
  }

  return res.json();
};
```

---

## Esquema de Base de Datos

Gestionado con **Prisma ORM** sobre **PostgreSQL**. El archivo `schema.prisma` actúa como la fuente de verdad del modelo de datos:

```
┌─────────────────── Usuario ────────────────────┐
│ id              Int       @id @autoincrement   │
│ username        String    @unique              │
│ email           String    @unique              │
│ passwordHash    String                         │
│ role            String    @default("usuario")  │ ← RBAC
│ mfaEnabled      Boolean   @default(false)      │ ← MFA toggle
│ otpCode         String?                        │ ← OTP temporal
│ otpExpiresAt    DateTime?                      │
│ tema            String    @default("light")    │ ← Preferencias
│ idioma          String    @default("es")       │
│ resetPasswordToken    String?                  │ ← Recovery email
│ resetPasswordExpires  DateTime?               │
│ secretQuestion        String?                  │ ← Recovery pregunta
│ secretAnswerHash      String?                  │
│ failedSecretAttempts  Int @default(0)          │
│ phone                 String?                  │ ← Recovery SMS/llamada
│ recoveryOtpCode       String?                  │
│ recoveryOtpExpiresAt  DateTime?               │
└────────────────────────────────────────────────┘
         │ 1
         │ (has many)
         │ N
┌─────────────── Sesion ─────────────────────────┐
│ id              Int       @id @autoincrement   │
│ usuarioId       Int       (FK → Usuario)       │
│ refreshToken    String    @unique              │ ← Token de sesión
│ dispositivo     String                         │ ← User-Agent parseado
│ ipAddress       String?                        │
│ createdAt       DateTime  @default(now())      │
│ lastUsedAt      DateTime  @default(now())      │ ← Última actividad
│ expiresAt       DateTime                       │
└────────────────────────────────────────────────┘
```

**Relación:** Un `Usuario` puede tener múltiples `Sesion` en el esquema, pero la aplicación fuerza sesión única eliminando las anteriores en cada nuevo login (`deleteMany` antes de `create`).

---

## Correspondencia con la Arquitectura de Referencia

La arquitectura solicitada en los requisitos y cómo se mapea al proyecto real:

| Referencia requerida | Equivalente en el proyecto | Ruta real |
|---|---|---|
| `/server/controllers/` | ✅ Idéntico | `backend/controllers/` |
| `/server/middlewares/` | ✅ Idéntico | `backend/middlewares/` |
| `/server/models/` | ✅ Prisma schema (ORM) | `backend/prisma/schema.prisma` |
| `/server/routes/` | ✅ Idéntico | `backend/routes/` |
| `/server/services/` | ✅ Integrado en controllers | `backend/controllers/*.js` |
| `/client/auth/` | ✅ Componentes de auth | `src/components/Login`, `Register`, `ForgotPassword` |
| `/client/dashboard/` | ✅ Dashboard y feed | `src/components/CommunityDashboard`, `AdminDashboard`, `Feed` |
| `/client/settings/` | ✅ Configuración de usuario | `src/components/UserSettings.jsx` |
| `/database/schema.sql` | ✅ Prisma schema + migraciones | `backend/prisma/schema.prisma` + `prisma/migrations/` |

> [!NOTE]
> La capa `/server/services/` del patrón de referencia está integrada directamente en los controladores en lugar de archivos separados. Esto es una decisión de simplicidad válida para el tamaño actual del proyecto. Si el proyecto escala, se recomienda extraer lógica como `generateTokens`, `sendRefreshTokenCookie` y `createSessionRecord` a un archivo `services/authService.js`.

---

## Tecnologías por Capa

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend framework | React + Vite | 19.x / 7.x |
| Estilos | Tailwind CSS | 4.x |
| Backend framework | Express | 5.x |
| ORM | Prisma Client | 6.x |
| Base de datos | PostgreSQL | — |
| Autenticación | jsonwebtoken + bcrypt | 9.x / 6.x |
| Rate Limiting | express-rate-limit | 8.x |
| Sesión persistente | cookie-parser (HttpOnly) | 1.4.x |
| User-Agent parsing | ua-parser-js | 2.x |
| Env management | dotenv | 17.x |

---

## Flujo de Autenticación Completo (visión de arquitectura)

```
CLIENTE (React)                      SERVIDOR (Express)              BASE DE DATOS (PostgreSQL)

Login.jsx
  │─── POST /api/auth/login ─────────► authRoutes.js
                                            │── loginLimiter (rate limit)
                                            └── authController.login()
                                                    │── prisma.usuario.findFirst()────► usuarios
                                                    │── bcrypt.compare()
                                                    │── generateTokens()
                                                    │── sendRefreshTokenCookie()
                                                    └── createSessionRecord() ─────────► sesiones
  ◄─── { accessToken, user } + Cookie ────────────────────────────────────────────────────┘

App.jsx
  │ localStorage.setItem('token', ...)
  │
  │─── GET /api/user/preferences ───► userRoutes.js
                                          │── authMiddleware()
                                          │       │── jwt.verify(token)
                                          │       └── prisma.sesion.findUnique() ────► sesiones
                                          └── userController.getPreferences() ────────► usuarios
  ◄─── { tema, idioma, mfaEnabled } ──────────────────────────────────────────────────────┘
```

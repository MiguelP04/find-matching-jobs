# Plan de Desarrollo: Sistema Web de Matching Laboral (UNEFA)

**Equipo**: 4 integrantes (2 Backend, 2 Frontend)
**Stack**: NestJS, NextJS, PostgreSQL, JSearch API, IA (Matching)
**Duración**: 8 Semanas

---

## Estructura del Repositorio (Monorepo Recomendado)
```
find-matching-jobs/
├── apps/
│   ├── backend/    (NestJS)
│   └── frontend/   (NextJS)
├── packages/
│   └── types/      (DTOs compartidos)
└── package.json
```

---

## Agent Skills (Herramientas de Desarrollo)

### NestJS (Backend)
- **TypeScript**: Tipado estático y decoradores.
- **NestJS CLI**: `nest generate` para módulos, controladores, servicios.
- **TypeORM/Prisma**: ORM para PostgreSQL.
- **Passport/JWT**: Estrategia de autenticación.
- **class-validator**: Validación de DTOs.
- **Axios**: Consumo de JSearch API.
- **Swagger**: Documentación de endpoints (`@nestjs/swagger`).
- **Jest**: Pruebas unitarias.

### NextJS (Frontend)
- **TypeScript**: Tipado para componentes y props.
- **App Router**: Enrutamiento basado en carpetas (Next.js 13+).
- **Tailwind CSS**: Estilizado rápido y responsivo.
- **Axios**: Consumo de API del backend.
- **React Hook Form**: Manejo de formularios y validación.
- **Zustand**: Gestión de estado ligera (o Context API).
- **SWR/React Query**: Fetching y caché de datos (opcional).

---

## Modelo de Datos (PostgreSQL)

| Tabla | Campos Principales |
|-------|-------------------|
| **Users** | `id` (PK), `nombre`, `apellido`, `email`, `password`, `rol` (estudiante/admin) |
| **Profiles** | `id` (PK), `user_id` (FK), `resumen_profesional`, `semestre`, `modalidad_preferida`, `github_url`, `linkedin_url` |
| **Skills** | `id` (PK), `nombre` (React, Node.js), `categoria` (Frontend/Backend/DB) |
| **Student_Skills** | `student_id` (FK), `skill_id` (FK), `nivel` (Básico/Intermedio/Avanzado) |
| **Jobs** | `id` (PK), `external_id` (JSearch), `titulo`, `empresa`, `descripcion`, `ubicacion`, `url_postulacion`, `fecha_publicacion` |
| **Match_Results** | `id` (PK), `student_id` (FK), `job_id` (FK), `score` (0-100), `justificacion_ia`, `missing_skills`, `fecha_analisis` |

---

## Cronograma de 8 Semanas

### Semana 1: Setup y Base de Datos
- [ ] Definir esquema final en PostgreSQL (TypeORM/Prisma).
- [ ] Configurar Monorepo: `backend/` (NestJS) y `frontend/` (NextJS).
- [ ] Instalar dependencias base en ambos proyectos.
- [ ] Configurar PostgreSQL local o Supabase/Neon.

### Semana 2: Autenticación y Perfiles (Backend)
- [ ] **Backend**: Módulo `Auth` (Registro, Login, JWT).
- [ ] **Backend**: Módulos `Users` y `Profiles` (CRUD).
- [ ] **Frontend**: Páginas de Login y Registro.
- [ ] **Frontend**: Contexto de autenticación (Zustand/Context).

### Semana 3: Habilidades y Vacantes (Backend)
- [ ] **Backend**: Módulo `Skills` y relación `Student_Skills`.
- [ ] **Backend**: Servicio de ingesta JSearch API -> Tabla `Jobs`.
- [ ] **Frontend**: Página de edición de perfil (Skills con niveles).

### Semana 4: Matching Inteligente (Backend)
- [ ] **Backend**: Lógica de comparación (Perfil vs Vacante).
- [ ] **Backend**: Generación de `score` y `justificacion_ia` (OpenAI/Lógica Difusa).
- [ ] **Backend**: Endpoint para obtener `Match_Results`.
- [ ] **Frontend**: Página de visualización de Matches (Score y justificación).

### Semana 5: Listado de Vacantes (Frontend)
- [ ] **Frontend**: Página de listado de `Jobs` con filtros (ubicación, modalidad).
- [ ] **Frontend**: Página de detalle de vacante.
- [ ] **Frontend**: Integración completa con API de Backend (Axios).

### Semana 6: Panel de Administrador y Ajustes
- [ ] **Backend**: Endpoint de estadísticas para admin.
- [ ] **Frontend**: Panel de administrador (Gestión de usuarios/vacantes).
- [ ] Ajustes de UI/UX y manejo de errores globales.

### Semana 7: Pruebas e Integración
- [ ] **Backend**: Pruebas unitarias con Jest en servicios críticos.
- [ ] **Frontend**: Pruebas de flujo completo (Registro -> Perfil -> Match).
- [ ] Corrección de bugs y validaciones faltantes.

### Semana 8: Despliegue y Documentación
- [ ] Desplegar Backend (Railway/Render).
- [ ] Desplegar Frontend (Vercel).
- [ ] Configurar variables de entorno en producción.
- [ ] Documentar API con Swagger y entregar manual de usuario.

---

## Flujo de la App
1. Estudiante: Registro -> Login -> Completar Perfil (Skills/Nivel).
2. Sistema: Ingestiona vacantes (JSearch) -> Ejecuta Matching (IA) -> Guarda en `Match_Results`.
3. Estudiante: Visualiza vacantes recomendadas ordenadas por `score`.
4. Admin: Visualiza estadísticas de empleabilidad.

---

## Referencias
- NestJS: https://docs.nestjs.com/
- NextJS: https://nextjs.org/docs
- JSearch API: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- TypeORM: https://typeorm.io/

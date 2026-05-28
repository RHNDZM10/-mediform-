# MediForm

Plataforma médica web para acceso de emergencia mediante NFC. El NFC solo apunta a una URL pública como `/profile/AB92KD`; los datos médicos se muestran únicamente después de validación hospitalaria.

## Funciones incluidas

- Frontend React + TypeScript + Tailwind, responsive, modo oscuro y estética hospitalaria premium.
- Backend Node.js + Express con JWT de 15 minutos, roles hospital/admin, validación de rutas y logs.
- Registro y edición de pacientes con edad automática, URL única, QR y vinculación NFC.
- Dashboard hospital: pacientes, búsqueda, historial de accesos, configuración y exportación PDF por impresión.
- Dashboard administrador: crear/aprobar/editar hospitales, ver pacientes, estadísticas, accesos y configuración global.
- Flujo NFC: `/profile/{ID}` detecta paciente, solicita validación hospitalaria y muestra datos autorizados.
- Supabase listo con esquema SQL en `supabase/schema.sql`.

## Credenciales de prueba

- Hospital: `hospital@mediform.test`
- Código hospitalario: `MEDI-2026`
- Contraseña válida: `Segura2026`
- Administrador: `admin`
- Contraseña administrador: `Mediform2026`

## Instalación

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:8787/api/health`

## Variables de entorno

Copia `.env.example` a `.env` y configura:

```bash
VITE_API_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PUBLIC_URL=https://your-domain.com
PORT=8787
```

## Despliegue en Vercel

1. Importa este proyecto en Vercel.
2. Agrega las variables de entorno anteriores.
3. Ejecuta el SQL de `supabase/schema.sql` en Supabase.
4. Despliega con el comando `npm run build`.

## NFC real

Graba en cada tarjeta o pulsera solo la URL pública del paciente, por ejemplo:

```text
https://tu-dominio.com/profile/AB92KD
```

No se almacenan datos médicos en el chip NFC.

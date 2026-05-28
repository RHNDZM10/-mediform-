create table if not exists hospitals (
  id text primary key,
  name text not null,
  email text unique not null,
  code text not null,
  code_expires_at timestamptz not null,
  status text not null check (status in ('pending', 'approved', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id text primary key,
  public_id text unique not null,
  hospital_id text not null references hospitals(id),
  full_name text not null,
  photo text,
  birth_date date not null,
  age int not null,
  gender text not null,
  blood_type text not null,
  emergency_contact text not null,
  phone text not null,
  relation text not null,
  conditions text not null,
  medications text not null,
  allergies text not null,
  doctor text not null,
  observations text not null,
  priority text not null check (priority in ('Baja', 'Media', 'Alta', 'Crítica')),
  status text not null check (status in ('Estable', 'Observación', 'Crítico')),
  medical_history text[] not null default '{}',
  profile_url text not null,
  qr_code text,
  nfc_linked boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists access_logs (
  id text primary key,
  patient_public_id text,
  hospital_id text,
  actor text not null,
  action text not null,
  result text not null check (result in ('allowed', 'denied')),
  created_at timestamptz not null default now()
);

alter table hospitals enable row level security;
alter table patients enable row level security;
alter table access_logs enable row level security;

create policy "service role full access hospitals" on hospitals for all using (auth.role() = 'service_role');
create policy "service role full access patients" on patients for all using (auth.role() = 'service_role');
create policy "service role full access logs" on access_logs for all using (auth.role() = 'service_role');

insert into hospitals (id, name, email, code, code_expires_at, status)
values ('HSP-001', 'Hospital Central MediForm', 'hospital@mediform.test', 'MEDI-2026', now() + interval '14 days', 'approved')
on conflict (id) do nothing;

insert into patients (
  id, public_id, hospital_id, full_name, birth_date, age, gender, blood_type,
  emergency_contact, phone, relation, conditions, medications, allergies, doctor,
  observations, priority, status, medical_history, profile_url, nfc_linked
)
values (
  'PAT-001', 'AB92KD', 'HSP-001', 'María Elena Vargas', '1944-08-12', 81, 'Femenino', 'O+',
  'Carlos Vargas', '+506 8888-1212', 'Hijo', 'Hipertensión arterial, diabetes tipo 2',
  'Losartán 50 mg, Metformina 850 mg', 'Penicilina', 'Dra. Sofía Méndez',
  'Movilidad reducida. Priorizar hidratación y monitoreo de glucosa.', 'Alta', 'Observación',
  array['Control cardiológico actualizado', 'Última glucosa registrada: 118 mg/dL'],
  '/profile/AB92KD', true
)
on conflict (public_id) do nothing;

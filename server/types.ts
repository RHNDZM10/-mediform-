export type Role = "hospital" | "admin";

export type Hospital = {
  id: string;
  name: string;
  email: string;
  code: string;
  codeExpiresAt: string;
  status: "pending" | "approved" | "suspended";
  createdAt: string;
};

export type Patient = {
  id: string;
  publicId: string;
  hospitalId: string;
  fullName: string;
  photo?: string;
  birthDate: string;
  age: number;
  gender: string;
  bloodType: string;
  emergencyContact: string;
  phone: string;
  relation: string;
  conditions: string;
  medications: string;
  allergies: string;
  doctor: string;
  observations: string;
  priority: "Baja" | "Media" | "Alta" | "Crítica";
  status: "Estable" | "Observación" | "Crítico";
  medicalHistory: string[];
  profileUrl: string;
  qrCode?: string;
  nfcLinked: boolean;
  updatedAt: string;
};

export type AccessLog = {
  id: string;
  patientPublicId?: string;
  hospitalId?: string;
  actor: string;
  action: string;
  result: "allowed" | "denied";
  createdAt: string;
};

export type SessionUser = {
  id: string;
  role: Role;
  name: string;
  email?: string;
};

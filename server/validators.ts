import { z } from "zod";

export const hospitalLoginSchema = z.object({
  hospitalName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  code: z.string().min(6)
});

export const adminLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8)
});

export const patientSchema = z.object({
  fullName: z.string().min(3),
  photo: z.string().optional(),
  birthDate: z.string().min(8),
  gender: z.string().min(2),
  bloodType: z.string().min(1),
  emergencyContact: z.string().min(3),
  phone: z.string().min(6),
  relation: z.string().min(2),
  conditions: z.string().min(2),
  medications: z.string().min(2),
  allergies: z.string().min(2),
  doctor: z.string().min(3),
  observations: z.string().min(2),
  priority: z.enum(["Baja", "Media", "Alta", "Crítica"]),
  status: z.enum(["Estable", "Observación", "Crítico"]).default("Estable"),
  medicalHistory: z.array(z.string()).default([])
});

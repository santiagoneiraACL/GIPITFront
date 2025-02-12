"use client";

import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ0-9 .-]+$/, {
      message:
        "El nombre solo puede contener letras, números, espacios, puntos y guiones",
    }),
  email: z.string().email("El correo electrónico debe ser válido"),
  position: z.string().min(2, "El rol debe tener mínimo 2 caracteres"),
});

export const companySchema = z.object({
  logo: z.instanceof(File).optional(),
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ0-9 .-]+$/, {
      message:
        "El nombre solo puede contener letras, números, espacios, puntos y guiones",
    }),
  description: z
    .string()
    .min(3, "La descripción debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ0-9 .-]+$/, {
      message:
        "La descripción solo puede contener letras, números, espacios, puntos y guiones",
    }),
});

export const managementSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ0-9 .-]+$/, {
      message:
        "El nombre solo puede contener letras, números, espacios, puntos y guiones",
    }),
  description: z
    .string()
    .min(3, "La descripción debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ0-9 .-]+$/, {
      message:
        "La descripción solo puede contener letras, números, espacios, puntos y guiones",
    }),
});

export const candidateSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ .-]+$/, {
      message:
        "El nombre solo puede contener letras, espacios, puntos y guiones",
    }),
  email: z.string().email("El correo electrónico debe ser válido"),
  phone: z
    .string()
    .min(9, "El teléfono debe tener mínimo 9 caracteres")
    .regex(/^\+?[0-9\s\-]+$/, {
      message: "El teléfono solo puede contener números, espacios, guiones y el símbolo +",
    }),
  address: z.string().min(5, "La dirección debe tener mínimo 5 caracteres"),
  cv: z
    .custom<File | null>((value) => value instanceof File, {
      message: "Debe subir un archivo de CV",
    })
    .refine((file) => file !== null && file.size > 0 && file.name.trim() !== "", {
      message: "Debe subir un archivo válido de CV",
    }),
});

export const editCandidateSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .regex(/^[A-Za-zÀ-ÿ .-]+$/, {
      message:
        "El nombre solo puede contener letras, espacios, puntos y guiones",
    }),
  email: z.string().email("El correo electrónico debe ser válido"),
  phone: z
    .string()
    .min(9, "El teléfono debe tener mínimo 9 caracteres")
    .regex(/^\+?[0-9\s\-]+$/, {
      message: "El teléfono solo puede contener números, espacios, guiones y el símbolo +",
    }),
  address: z.string().min(5, "La dirección debe tener mínimo 5 caracteres"),
});

export const processSchema = z.object({
  client: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), {
      message: "Selecciona un cliente válido",
    }),
  management_id: z
    .string()
    .refine((val) => val !== "", {
      message: "Selecciona una jefatura válida", // Mensaje claro para el usuario
    }),
  jobOffer: z
    .string()
    .min(1, "El perfil buscado es obligatorio")
    .regex(/^[A-Za-zÀ-ÿ0-9 .-]+$/, {
      message:
        "El perfil solo puede contener letras, números, espacios, puntos y guiones",
    }),
  jobOfferDescription: z
    .string()
    .min(1, "La descripción de la vacante es obligatoria"), // Solo valida que no esté vacío,
});

// Esquema para creación de notas (todos los campos obligatorios)
export const createNoteSchema = z.object({
  techSkills: z
    .string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 1 && num <= 7;
    }, "Las habilidades técnicas deben ser un número entre 1 y 7."),
  softSkills: z
    .string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 1 && num <= 7;
    }, "Las habilidades blandas deben ser un número entre 1 y 7."),
  comment: z.string().min(1, "El comentario es obligatorio."),
});

// Esquema para edición de notas (campos opcionales)
export const editNoteSchema = z.object({
  techSkills: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 1 && parseFloat(val) <= 7),
      "Las habilidades técnicas deben ser un número entre 1 y 7."
    ),
  softSkills: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 1 && parseFloat(val) <= 7),
      "Las habilidades blandas deben ser un número entre 1 y 7."
    ),
  comment: z.string().optional(),
});


export const evaluationSchema = z.object({
  eval_cumplimiento: z.number().min(0).max(7),
  eval_stack: z.number().min(0).max(7),
  eval_comunicacion: z.number().min(0).max(7),
  eval_motivacion: z.number().min(0).max(7),
  benefit: z.string().optional(),
  client_comment: z.string().optional(),
  acciones_acl: z.string().optional(),
  proyecction: z.string().optional(),
  date: z.string(),
});
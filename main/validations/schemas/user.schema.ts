import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  name: z.string().min(1, "El nombre es requerido"),
  role: z.enum(["admin", "user", "manager"]),
  status: z.enum(["active", "inactive", "pending"]),
  permissions: z.array(z.string()),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const UserCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  roleId: z.string().min(1, "El rol es requerido"),
  isActive: z.boolean().optional(),
  customPermissions: z.string().optional(),
});

export const UserUpdateSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
  customPermissions: z.string().optional(),
});

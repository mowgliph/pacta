"use client";
import { useAuth } from "../../store/auth";
export default function TestAuthPage() {
  const { user } = useAuth();
  return <div>{user ? "Autenticado" : "No autenticado"}</div>;
}
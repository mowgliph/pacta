"use client";

import { ModernLoginForm } from "../components/auth/modern-login-form";

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <ModernLoginForm />
    </div>
  );
}

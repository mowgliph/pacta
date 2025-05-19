import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { Form } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const success = await login({ email, password });
    if (success) {
      navigate("/dashboard");
    } else {
      setFormError(error || "Error de autenticación");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5] flex-col">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-4"
            />
            {formError && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Error de autenticación</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

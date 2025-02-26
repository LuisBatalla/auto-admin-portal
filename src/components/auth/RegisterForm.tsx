
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Registro exitoso",
        description: "Por favor, verifica tu correo electrónico para continuar",
      });
      
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full p-6 space-y-4 bg-white shadow-md">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="text-gray-500">Registra tus datos para comenzar</p>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </Button>
      </form>
      <div className="text-center text-sm">
        <span className="text-gray-500">¿Ya tienes una cuenta?</span>{" "}
        <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
          Iniciar Sesión
        </Button>
      </div>
    </Card>
  );
};

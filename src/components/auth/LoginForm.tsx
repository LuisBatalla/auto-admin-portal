
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
        <p className="text-gray-500">Ingresa tus credenciales para continuar</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </form>
    </Card>
  );
};

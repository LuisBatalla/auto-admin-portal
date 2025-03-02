
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  isAdmin: false,
  userRole: null 
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const checkUserRole = async (userId: string) => {
    try {
      // Usar la función más simple solo para obtener el rol
      const { data, error } = await supabase.rpc('get_user_role_securely', {
        user_uuid: userId,
      });

      if (error) {
        console.error('Error al obtener rol del usuario:', error);
        return;
      }

      console.log('Rol obtenido:', data);
      setUserRole(data);
      setIsAdmin(data === 'admin');
    } catch (error) {
      console.error('Error al verificar roles:', error);
    }
  };

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        checkUserRole(currentUser.id);
      } else {
        setUserRole(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        checkUserRole(currentUser.id);
      } else {
        setUserRole(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('Estado de autenticación:', { user, isAdmin, userRole });

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, userRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

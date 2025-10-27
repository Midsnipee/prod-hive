import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, User } from '@/lib/db';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, displayName: string, department: string, site: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      db.users.get(storedUserId).then(foundUser => {
        if (foundUser) {
          setUser(foundUser);
        } else {
          localStorage.removeItem('userId');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await db.users.where('email').equals(email).first();
      
      if (!foundUser || foundUser.password !== password) {
        toast.error('Email ou mot de passe incorrect');
        return false;
      }

      setUser(foundUser);
      localStorage.setItem('userId', foundUser.id);
      toast.success(`Bienvenue ${foundUser.displayName}!`);
      return true;
    } catch (error) {
      toast.error('Erreur lors de la connexion');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    toast.success('Déconnexion réussie');
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    department: string,
    site: string
  ): Promise<boolean> => {
    try {
      const existingUser = await db.users.where('email').equals(email).first();
      if (existingUser) {
        toast.error('Cet email est déjà utilisé');
        return false;
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        password,
        displayName,
        department,
        site,
        role: 'lecteur', // Default role
        createdAt: new Date()
      };

      await db.users.add(newUser);
      setUser(newUser);
      localStorage.setItem('userId', newUser.id);
      toast.success('Compte créé avec succès!');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

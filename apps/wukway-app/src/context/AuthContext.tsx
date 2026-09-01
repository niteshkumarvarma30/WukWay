import React, { createContext, useState, useContext, ReactNode } from 'react';

export type User = {
  id: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'VENDOR';
};

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  roleTemp: 'CUSTOMER' | 'VENDOR' | null;
  setRoleTemp: (role: 'CUSTOMER' | 'VENDOR' | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roleTemp, setRoleTemp] = useState<'CUSTOMER' | 'VENDOR' | null>(null);

  const logout = () => {
    setUser(null);
    setRoleTemp(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, roleTemp, setRoleTemp, logout }}>
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

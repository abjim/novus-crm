import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'u-123',
  name: 'Alex Mercer',
  email: 'alex.mercer@novuscrm.com',
  role: 'Admin', // Upgraded to Admin for demo purposes
  avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Mercer&background=c7d2fe&color=3730a3',
  brandIds: ['LB', 'SP', 'PM'], // Brands this user manages
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking for a valid session token on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('novus-token');
      const storedUser = localStorage.getItem('novus-user');
      
      if (storedToken && storedUser) {
        // Simulate network latency for token validation
        await new Promise(resolve => setTimeout(resolve, 800));
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user session");
          localStorage.removeItem('novus-token');
          localStorage.removeItem('novus-user');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, validate credentials here. 
    // For this mock, we accept any input but attach the email to the mock user.
    const userWithEmail = { ...MOCK_USER, email };
    
    setUser(userWithEmail);
    localStorage.setItem('novus-token', 'mock-jwt-token-xyz-123');
    localStorage.setItem('novus-user', JSON.stringify(userWithEmail));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('novus-token');
    localStorage.removeItem('novus-user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
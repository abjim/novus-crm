import React from 'react';

export type Theme = 'light' | 'dark';

export type UserRole = 'Agent' | 'Manager' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  brandIds: string[]; // Access control for multi-brand setup
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}
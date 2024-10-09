"use client"
import React, { createContext, useState, useContext } from 'react';

import { UsernameContextType } from '../../app/types';

const contextProvider = createContext<UsernameContextType | undefined>(undefined);

export const UsernameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState("");
  const [Attempted, setAttempted] = useState<string[]>([]);

  return (
    <contextProvider.Provider value={{ username, setUsername,Attempted,setAttempted }}>
      {children}
    </contextProvider.Provider>
  );
};

export const useUsername = () => {
  const context = useContext(contextProvider);
  if (context === undefined) {
    throw new Error('useUsername must be used within a UsernameProvider');
  }
  return context;
};
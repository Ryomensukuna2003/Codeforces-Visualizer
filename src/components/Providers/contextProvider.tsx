"use client"
import React, { createContext, useState, useContext } from 'react';

interface UsernameContextType {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  Attempted:string[];
  setAttempted: React.Dispatch<React.SetStateAction<string[]>>;
}

const contextProvider = createContext<UsernameContextType | undefined>(undefined);

export const UsernameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState("_Ryomen_sukuna");
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
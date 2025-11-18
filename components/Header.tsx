import React from 'react';
import { Shapes } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white p-4 flex items-center border-b border-gray-200">
        <Shapes className="h-8 w-8 text-black mr-3" />
        <h1 className="text-2xl font-bold text-black tracking-tight">
            UML Diagram Generator
        </h1>
    </header>
  );
};
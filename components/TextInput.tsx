import React from 'react';
import { Bot, Zap } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col h-full p-6 bg-white">
      <div className="flex items-center text-lg font-semibold text-black mb-4">
        <Bot className="h-6 w-6 mr-2 text-black"/>
        Enter System Requirements
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Describe the classes, attributes, methods, and relationships of your system. The more detailed your description, the more accurate the initial diagram will be.
      </p>
      <textarea
        value={value}
        onChange={onChange}
        placeholder="e.g., A Car has a color and a model. It can startEngine() and stopEngine(). A Car is a type of Vehicle. A Car has an Engine..."
        className="w-full flex-1 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-black focus:border-black transition-shadow text-base"
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !value.trim()}
        className="mt-4 w-full flex items-center justify-center bg-black text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5 mr-2" />
            Generate Diagram
          </>
        )}
      </button>
    </div>
  );
};
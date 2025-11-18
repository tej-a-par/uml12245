import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TextInput } from './components/TextInput';
import { UmlDiagram } from './components/UmlDiagram';
import { ChatPanel } from './components/ChatPanel';
import { generateInitialDiagram, refineDiagram } from './services/geminiService';
import type { ChatMessage } from './types';
import { Loader } from './components/Loader';

export default function App() {
  const [stage, setStage] = useState<'input' | 'refinement'>('input');
  const [requirements, setRequirements] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!requirements.trim()) {
      setError('Please enter some requirements.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateInitialDiagram(requirements);
      setMermaidCode(result.mermaidCode);
      setChatMessages([{ role: 'model', content: result.initialMessage }]);
      setStage('refinement');
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate diagram. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [requirements]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const result = await refineDiagram(newMessages, mermaidCode);
      setMermaidCode(result.mermaidCode);
      setChatMessages([...newMessages, { role: 'model', content: result.response }]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      const errorResponseMessage: ChatMessage = {
        role: 'model',
        content: `Sorry, I encountered an error. Please try again. \n\nDetails: ${errorMessage}`,
      };
      setChatMessages([...newMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatMessages, mermaidCode, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left Panel */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          {stage === 'input' ? (
            <TextInput
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex-1 p-4 flex flex-col items-center justify-center relative min-h-0">
              {isLoading && !mermaidCode && <Loader message="Generating initial diagram..." />}
              {mermaidCode && <UmlDiagram code={mermaidCode} />}
            </div>
          )}
           {error && (
            <div className="p-4 bg-red-100 text-red-700 border-t border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          {stage === 'input' ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-400"><path d="M12 12v-2"/><path d="M15 15.343V15a3 3 0 0 0-5.657-1.343l-1.428 1.428A3 3 0 0 0 9 17.07v.001a3 3 0 0 0 5.657 1.343l1.428-1.428A3 3 0 0 0 15 15.343z"/><path d="m20.5 10-.343.343A3 3 0 0 1 18.07 9h-.001a3 3 0 0 1-1.343 5.657l-1.428 1.428A3 3 0 0 1 17 17.07v.001a3 3 0 0 1-5.657-1.343l-1.428-1.428A3 3 0 0 1 9 12.657V12a3 3 0 0 1 5.657-1.343L15 11l.343.343A3 3 0 0 0 17.43 12h.001a3 3 0 0 0 2.121-.879L20 10.5l.5.5.5-.5-2-2-.5.5.5.5 1.5 1.5a3 3 0 0 1-2.121 5.121l-1.428-1.428A3 3 0 0 1 15 12.657V12a3 3 0 0 1-1.343-5.657L12.23 4.914a3 3 0 0 1-4.243 4.243l-1.414 1.414"/></svg>
                <h2 className="text-lg font-semibold text-black">Conversational Refinement</h2>
                <p className="mt-1 max-w-md">After generating the initial diagram, this panel will become a chatbot. You can then use natural language to validate, clarify, and modify the UML diagram.</p>
             </div>
          ) : (
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}
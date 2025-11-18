import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle } from 'lucide-react';

interface UmlDiagramProps {
  code: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#000000',
    primaryBorderColor: '#333333',
    lineColor: '#000000',
    secondaryColor: '#ffffff',
    tertiaryColor: '#ffffff',
  }
});

export const UmlDiagram: React.FC<UmlDiagramProps> = ({ code }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mermaidRef.current && code) {
      const renderDiagram = async () => {
        try {
          setError(null);
          // Unique ID for each render to avoid conflicts
          const id = `mermaid-graph-${Date.now()}`;
          const { svg } = await mermaid.render(id, code);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Caught Mermaid render error:", e);
          const errorMessage = e instanceof Error ? e.message : String(e);
          setError(`Failed to render diagram. The generated syntax might be invalid. Error: ${errorMessage}`);
        }
      };
      renderDiagram();
    }
  }, [code]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-700 p-4 rounded-md">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-bold">Diagram Error</h3>
        <p className="text-center">{error}</p>
        <pre className="mt-4 p-2 bg-red-100 text-xs rounded w-full max-w-lg overflow-auto text-left">
          {code}
        </pre>
      </div>
    );
  }

  return <div ref={mermaidRef} className="w-full h-full flex items-center justify-center" key={code}></div>;
};
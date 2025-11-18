import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.OBJECT,
        properties: {
            mermaidCode: {
                type: Type.STRING,
                description: "The complete and valid Mermaid.js syntax for the class diagram. It should start with `classDiagram`."
            },
            initialMessage: {
                type: Type.STRING,
                description: "A friendly message to the user explaining the generated diagram and asking for feedback or clarification."
            }
        },
        required: ["mermaidCode", "initialMessage"],
    },
};

const refinementConfig = {
     responseMimeType: "application/json",
     responseSchema: {
        type: Type.OBJECT,
        properties: {
            mermaidCode: {
                type: Type.STRING,
                description: "The complete and valid updated Mermaid.js syntax for the class diagram based on the user's latest message. If no changes are needed, return the original code."
            },
            response: {
                type: Type.STRING,
                description: "A helpful, conversational response to the user's message, explaining the changes made or asking for more clarification."
            }
        },
        required: ["mermaidCode", "response"],
    },
}

export async function generateInitialDiagram(requirements: string): Promise<{ mermaidCode: string; initialMessage: string }> {
    const prompt = `
You are an expert system designer specializing in creating UML class diagrams from user requirements. Your analysis must be meticulous to ensure accuracy.

Analyze the following user requirements and generate a UML Class Diagram using Mermaid.js syntax.

**Analysis Steps:**

1.  **Identify Classes:** Find the main entities or concepts in the requirements. These are typically nouns.

2.  **Identify Attributes and Methods:**
    *   **Attributes:** For each class, find its properties or characteristics. Look for nouns associated with a class. Pay close attention to data types (e.g., string, integer, boolean, list). If a type isn't specified, infer a common one. Format attributes inside the class block as \`+attributeName: type\`.
    *   **Methods:** Identify actions or behaviors associated with each class. These are typically verbs. Format methods as \`+methodName()\`.

3.  **Identify Relationships:** This is a critical step. Carefully determine the correct relationship between classes based on these rules:
    *   **Inheritance (\`<|--\`):** Use for "is-a" relationships. Keywords: "is a", "extends", "is a type of", "inherits from". (e.g., "A Car is a Vehicle" -> \`Vehicle <|-- Car\`).
    *   **Composition (\`*--\`):** Use for strong "has-a" or "part-of" relationships where the child object's lifecycle depends on the parent. Keywords: "is composed of", "contains". (e.g., "A House has Rooms" -> \`House *-- Room\`).
    *   **Aggregation (\`o--\`):** Use for weak "has-a" relationships where the child object can exist independently of the parent. Keywords: "has a", "holds". (e.g., "A Department has Professors" -> \`Department o-- Professor\`).
    *   **Association (\`-->\` or \`--\`):** Use for general relationships like "uses" or "interacts with". Add labels to describe the association. (e.g., "A Student enrolls in a Course" -> \`Student --> "enrolls in" Course\`).
    *   **Cardinality:** Where possible, add cardinality to relationships (e.g., \`Car "1" -- "*" Wheel\`).

4.  **Generate Mermaid Code:** Combine the above analysis into a complete and valid Mermaid.js code block starting with \`classDiagram\`.

5.  **Write Initial Message:** Write a brief, friendly message to the user summarizing the diagram and inviting them to refine it. Mention one or two key relationships you identified to show your reasoning.

**User Requirements:**
"${requirements}"

Please provide the output in the specified JSON format.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: generationConfig,
    });
    
    const text = response.text.trim();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Gemini response for initial generation:", text);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
}

export async function refineDiagram(chatHistory: ChatMessage[], currentMermaidCode: string): Promise<{ mermaidCode: string; response: string }> {
    const formattedHistory = chat
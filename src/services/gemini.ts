import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Task {
  id: string;
  name: string;
  start: string; // ISO date
  end: string;   // ISO date
  actualStart?: string; // ISO date
  actualEnd?: string;   // ISO date
  progress: number; // 0-100
  dependencies?: string[]; // IDs of tasks this task depends on
  assignee?: string;
  category?: string;
  subcategory?: string;
}

export interface ProjectPlan {
  projectName: string;
  tasks: Task[];
}

export async function parseProjectPlan(text: string): Promise<ProjectPlan> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse the following project plan text into a structured JSON format for a Gantt chart. 
    Ensure dates are in YYYY-MM-DD format. If dates are not specified, estimate reasonable dates starting from today (${new Date().toISOString().split('T')[0]}).
    If the input text is in Chinese, ensure the output fields (projectName, task names, categories, subcategories) are also in Chinese.
    
    Project Plan Text:
    ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                actualStart: { type: Type.STRING },
                actualEnd: { type: Type.STRING },
                progress: { type: Type.NUMBER },
                dependencies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                assignee: { type: Type.STRING },
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING }
              },
              required: ["id", "name", "start", "end", "progress"]
            }
          }
        },
        required: ["projectName", "tasks"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

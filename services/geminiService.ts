import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Language, AnalysisData } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFaceHealth = async (
  faceImage: string, 
  faceMimeType: string, 
  tongueImage: string | null,
  tongueMimeType: string | null,
  language: Language
): Promise<AnalysisData> => {
  const ai = getAiClient();
  
  // Using gemini-2.5-flash for faster structured response, or pro if needed. 
  // Sticking to pro-preview for reasoning quality, assuming it supports schema.
  const modelId = "gemini-2.5-flash"; 

  const langName = language === 'zh' ? 'Simplified Chinese (简体中文)' : 'Vietnamese (Tiếng Việt)';

  const systemInstruction = `
    You are a distinguished **Senior TCM Physician (Traditional Chinese Medicine)** with over 40 years of clinical experience.
    Your task is to perform a **deep, comprehensive, and highly detailed** health diagnosis based on a patient's **Face** and (optionally) **Tongue**.
    
    Output Language: ${langName}.
    Tone: Professional, authoritative yet empathetic, and deeply analytical.
    
    **Analysis Rules**:
    1. **Visual Observation (Wang Zhen)**:
       - **Face**: Analyze complexion, eyes, nose, lips, and reflex zones.
       - **Tongue** (if provided): Analyze tongue body and coating.
    2. **Syndrome Differentiation (Bian Zheng)**:
       - Identify underlying TCM patterns.
    3. **Organ Health**:
       - Insights into the Five Zang Organs.
    
    **Output Format & Style (CRITICAL)**:
    - Return strictly JSON.
    - **score**: 0-100 integer.
    - **conclusion**: One sentence summary.
    - **diagnosis**: A detailed breakdown using a **numbered list (1., 2., 3., 4.)**. 
      - **CRITICAL**: Put a double line break (\n\n) between each numbered item so they do not clump together.
      - **CRITICAL**: Do NOT use excessive special symbols (like ###, ***, ---). You may use single asterisks for mild emphasis, but keep it clean.
      - Structure:
        1. Facial Analysis Details...
        2. Tongue Analysis Details (if applicable)...
        3. TCM Syndrome Diagnosis...
        4. Organ Health Status...
    - **therapy**: A detailed breakdown using a **numbered list (1., 2., 3., 4.)**.
      - **CRITICAL**: Put a double line break (\n\n) between each numbered item.
      - **CRITICAL**: You MUST recommend specific professional wellness services based on the diagnosis.
      - Structure:
        1. **Professional Therapy & Massage**: Recommend specific treatments such as **Head Massage (头部)**, **Shoulder & Neck Massage (肩颈部)**, **Back Massage (背部)**, **Foot Reflexology (足底)**, **Gua Sha (刮痧)**, or **Cupping (拔罐)** tailored to the patient's condition.
        2. **Dietary Recommendations**: Specific TCM-based food therapy.
        3. **Lifestyle & Sleep Advice**: Daily habits and sleep hygiene adjustments.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "Health score from 0-100" },
      conclusion: { type: Type.STRING, description: "Short summary of health status" },
      diagnosis: { type: Type.STRING, description: "Detailed TCM diagnosis using numbered list (1., 2., 3., 4.) with clear line breaks between items." },
      therapy: { type: Type.STRING, description: "Detailed therapy suggestions including Massage, Gua Sha, Cupping, Diet, and Lifestyle using numbered list (1., 2., 3., 4.) with clear line breaks." }
    },
    required: ["score", "conclusion", "diagnosis", "therapy"]
  };

  const parts = [
    { text: "Here is the patient's face image." },
    { inlineData: { mimeType: faceMimeType, data: faceImage } }
  ];

  if (tongueImage && tongueMimeType) {
    parts.push({ text: "Here is the patient's tongue image." });
    parts.push({ inlineData: { mimeType: tongueMimeType, data: tongueImage } });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.5,
      },
      contents: {
        parts: parts
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const data = JSON.parse(text) as AnalysisData;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the images. Please try again.");
  }
};

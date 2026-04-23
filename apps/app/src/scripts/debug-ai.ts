import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const apiKey = process.env.GEMINI_API_KEY;

async function testAI() {
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.error("❌ No valid API key found.");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const mockManifest = [
    {
      table: "public.employees",
      rows: 300024,
      health: 100,
      relationships: [],
      columns: [
        { name: "emp_no", type: "integer", stats: { min: 10001, max: 499999 } },
        { name: "hire_date", type: "date", stats: { min: "1985-01-01", max: "2000-01-28" } }
      ]
    }
  ];

  const prompt = `
    You are DataBreef, a premium database intelligence agent.
    Analyze the following database manifest and generate a high-fidelity intelligence brief.
    
    MANIFEST:
    ${JSON.stringify(mockManifest, null, 2)}
    
    INSTRUCTIONS:
    1. Determine the 'Domain Context'.
    2. Write an 'Executive Summary' (2 detailed paragraphs).
    3. Describe the 'Data Landscape'.
    4. Provide 3-5 'Dynamic Key Metrics'.
    
    OUTPUT FORMAT (JSON ONLY, NO MARKDOWN TAGS):
    {
      "executiveSummary": "...",
      "dataLandscape": "...",
      "strategicAnomalies": [],
      "trends": [],
      "keyMetrics": [],
      "domainContext": "..."
    }
  `;

  console.log("🌊 Sending test prompt to Gemini...");
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("✨ RAW RESPONSE:\n", text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("✅ PARSED JSON SUCCESSFUL");
    } else {
      console.error("❌ NO JSON FOUND IN RESPONSE");
    }
  } catch (error: any) {
    console.error("💥 AI FAILED:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testAI();

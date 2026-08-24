import prisma from "../config/prisma.js";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { canAccessProject } from "../utility/authz.js";

// 1. Define the Strict Schema for Documentation
// Ye ensure karega ke AI hamesha sahi format return kare
const documentationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          pages: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                slug: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING }, // Markdown content here
              },
              required: ["id", "title", "slug", "description"],
            },
          },
        },
        required: ["title", "pages"],
      },
    },
  },
  required: ["sections"],
};

// 2. Initialize Gemini with Config & Schema
const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // Aapka preferred model
    generationConfig: {
        temperature: 0.5, // Thora creative lekin structured
        maxOutputTokens: 8192, // Long content allowed
        responseMimeType: "application/json",
        responseSchema: documentationSchema // Schema locking
    } 
  });
};

// --- RETRY LOGIC (Traffic/Overload Handling) ---
const generateWithRetry = async (model, prompt, retries = 3, delay = 2000) => {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    if (retries > 0 && (error.status === 503 || error.message.includes('overloaded'))) {
      console.warn(`[AI Overloaded] Retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateWithRetry(model, prompt, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const generateProjectDocs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; 

    console.log(`[Docs Gen] Starting for Project: ${projectId}`);

    // Auth & Validation
    const projectAuth = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, name: true } 
    });

    if (!projectAuth || projectAuth.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this project" });
    }

    const explanations = await prisma.codeExplanation.findMany({
      where: { projectId: projectId },
      select: { id: true, fileName: true, explanationDoc: true } 
    });

    if (explanations.length === 0) {
      return res.status(400).json({ message: "No analyzed files found." });
    }

    // Context Preparation
    const fileList = explanations.map(ex => {
      let overview = "No summary";
      try {
        const doc = typeof ex.explanationDoc === 'string' ? JSON.parse(ex.explanationDoc) : ex.explanationDoc;
        if (doc?.overview) overview = doc.overview.substring(0, 300);
      } catch (e) {}
      return `ID: ${ex.id} | Name: ${ex.fileName} | Summary: ${overview}...`;
    }).join("\n");

    // Prompt (Ab JSON format sikhane ki zarurat nahi, sirf content pe focus)
  const prompt = `
      You are a Senior Technical Writer. 
      Generate a structured documentation for the project: "${projectAuth.name}".
      
      FILES TO ANALYZE:
      ${fileList}

      YOUR TASK:
      Return a JSON object with a detailed 'description' for each file.

      ⭐⭐ CRITICAL FORMATTING RULES FOR 'description' FIELD ⭐⭐:
      1. The 'description' must be a valid String containing **Markdown**.
      2. **SEPARATION IS KEY:** You MUST put a double newline (\\n\\n) before and after every Heading.
      
      ❌ BAD FORMAT (Do NOT do this):
      "### OverviewThis module handles login.### ArchitectureIt uses JWT."
      
      ✅ GOOD FORMAT (Do EXACTLY this):
      "### Overview\\n\\nThis module handles login functionality safely.\\n\\n### Architecture\\n\\nIt utilizes JWT for stateless authentication..."

      3. STRUCTURE:
         - Start with a clear summary.
         - Use "### Key Logic" for internal workings.
         - Use "### Data Flow" for inputs/outputs.
         - Use Bullet points (- ) for lists.

      OUTPUT JSON STRUCTURE:
      {
        "sections": [
          {
            "title": "Section Name",
            "pages": [
              {
                "id": "Exact File ID",
                "title": "Readable Page Title",
                "slug": "kebab-case-slug",
                "description": "MARKDOWN_STRING_HERE"
              }
            ]
          }
        ]
      }
    `;
    // Execute with Retry
    const model = getGeminiModel();
    const result = await generateWithRetry(model, prompt);
    
    // Direct Object access (No need to parse JSON string manually!)
    // Kyunke responseSchema use kiya hai, result.response.text() already valid JSON string hoga.
    const structure = JSON.parse(result.response.text());

    // Save to DB
    const docs = await prisma.documentation.upsert({
      where: { projectId: projectId },
      update: { 
        structure,
        title: `${projectAuth.name} Documentation`,
        description: `Auto-generated documentation`
      },
      create: {
        projectId: projectId,
        structure,
        title: `${projectAuth.name} Documentation`,
        description: `Auto-generated documentation`
      }
    });

    console.log("[Docs Gen] Success");
    res.status(200).json({ success: true, docs });

  } catch (error) {
    console.error("[Docs Gen ERROR]:", error);
    const status = error.status === 503 ? 503 : 500;
    const msg = error.status === 503 ? "AI Service Overloaded. Please try again." : "Failed to generate docs.";
    
    res.status(status).json({ message: msg, error: error.message });
  }
};

// ... getProjectDocs (Same as before) ...
export const getProjectDocs = async (req, res) => {
    // ... (Use previous implementation)
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
    
        if (!(await canAccessProject(userId, projectId))) {
          return res.status(403).json({ message: "Unauthorized" });
        }
    
        const docs = await prisma.documentation.findUnique({
          where: { projectId: projectId }
        });
        
        if (!docs) {
          return res.status(404).json({ message: "Documentation not generated yet." });
        }
        
        res.status(200).json({ success: true, docs });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};
import prisma from "../config/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateProjectDocs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id; 

    // 1. Verify Project Ownership & Existence (Fast check)
    const projectAuth = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, name: true } // Fetch only needed fields
    });

    if (!projectAuth || projectAuth.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this project" });
    }

    // 2. Fetch analyzed files (Optimized Selection)
    const explanations = await prisma.codeExplanation.findMany({
      where: { projectId: projectId },
      select: { 
        id: true, 
        fileName: true, 
        // We only fetch the JSON. We will parse it in memory.
        explanationDoc: true 
      } 
    });

    if (explanations.length === 0) {
      return res.status(400).json({ message: "No analyzed files found. Please analyze some files first." });
    }

    // 3. Prepare Context for AI (Token Optimized)
    // We map over the files and truncate long text to save AI tokens and time.
    const fileList = explanations.map(ex => {
      let overview = "No summary available";
      let logicFlow = "";
      
      try {
        // Parse if it's a string, otherwise use directly
        const doc = typeof ex.explanationDoc === 'string' 
          ? JSON.parse(ex.explanationDoc) 
          : ex.explanationDoc;
          
        if (doc) {
          // Truncate to 500 chars max to speed up AI processing
          overview = doc.overview ? doc.overview.substring(0, 500) : overview;
          logicFlow = doc.logicFlow ? doc.logicFlow.substring(0, 500) : "";
        }
      } catch (e) {
        console.warn(`Failed to parse doc for file ${ex.id}`);
      }
        
      return `ID: ${ex.id}\nName: ${ex.fileName}\nSummary: ${overview}...\nLogic: ${logicFlow}...\n---`;
    }).join("\n");
const prompt = `
      You are a Principal Software Architect.
      Generate a COMPREHENSIVE, DEEP-DIVE documentation structure.

      PROJECT CONTEXT: ${projectAuth.name}
      ANALYZED FILES: ${fileList}

      YOUR GOAL:
      Create highly detailed documentation covering Architecture, Logic, Data Flow, and Error Handling.

      OUTPUT FORMAT (Strict JSON):
      {
        "sections": [
          {
            "title": "Section Name",
            "pages": [
              {
                "id": "Exact File ID",
                "title": "Professional Title",
                "slug": "kebab-case-slug",
                "description": "MARKDOWN STRING HERE"
              }
            ]
          }
        ]
      }

      CRITICAL INSTRUCTIONS FOR 'description':
      1. The 'description' field MUST be a long string using **Markdown formatting**.
      2. Use **Bold** for key concepts.
      3. Use \n\n for line breaks.
      4. Use bullet points (- ) for lists.
      5. Cover these points:
         - **Purpose:** Why does this file exist?
         - **Key Logic:** How does it work step-by-step?
         - **Data Flow:** Inputs and Outputs.
         - **Dependencies:** What other files does it use?

      EXAMPLE DESCRIPTION CONTENT:
      "This module handles user authentication.\n\n**Key Features:**\n- Validates JWT tokens.\n- Manages session expiry.\n\n**Logic Flow:**\n1. Extracts token from header.\n2. Verifies signature using secret."

      STRICT RULES:
      - Use EXACT File IDs.
      - Return ONLY valid JSON.
    `;

    // 4. Call AI (Using flash model for speed)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Flash is faster and cheaper for this task
        generationConfig: { responseMimeType: "application/json" } 
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean response
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const structure = JSON.parse(cleanJson);

    // 5. Save to DB (Upsert is optimal here)
    const docs = await prisma.documentation.upsert({
      where: { projectId: projectId },
      update: { 
        structure,
        title: `${projectAuth.name} Documentation`,
        description: `Auto-generated documentation for ${projectAuth.name}`
      },
      create: {
        projectId: projectId,
        structure,
        title: `${projectAuth.name} Documentation`,
        description: `Auto-generated documentation for ${projectAuth.name}`
      }
    });

    res.status(200).json({ success: true, docs });

  } catch (error) {
    console.error("Docs Gen Error:", error);
    res.status(500).json({ 
        message: "Failed to generate documentation", 
        error: error.message 
    });
  }
};

export const getProjectDocs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 1. Optimized Check: Check project auth AND fetch doc in parallel if possible, 
    // but sequential is safer for permission logic. 
    // We only select needed fields to reduce payload size.
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true }
    });

    if (!project || project.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const docs = await prisma.documentation.findUnique({
      where: { projectId: projectId },
      select: {
          id: true,
          title: true,
          description: true,
          structure: true,
          createdAt: true
      }
    });
    
    if (!docs) {
      return res.status(404).json({ message: "Documentation not generated yet." });
    }
    
    res.status(200).json({ success: true, docs });
  } catch (error) {
    console.error("Get Docs Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
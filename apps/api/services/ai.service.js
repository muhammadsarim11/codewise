import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the structured schema
const CodeExplanationSchema = {
  type: "OBJECT",
  properties: {
    commentedCode: { 
      type: "STRING",
      description: "The original code with concise, helpful inline comments added."
    },
    explanationDoc: {
      type: "OBJECT",
      description: "A comprehensive, documentation-style explanation of the code.",
      properties: {
        overview: {
          type: "STRING",
          description: "A high-level summary. **IMPORTANT: Be concise, 1-2 sentences MAX.**"
        },
        logicFlow: {
          type: "STRING",
          description: "A **bulleted list** of the step-by-step logic. **Be brief.**"
        },
        functionBreakdown: {
          type: "STRING",
          description: "A breakdown of **ONLY the 2-3 most important functions/classes**. Explain parameters & return value. Be concise."
        },
        usageExample: {
          type: "STRING",
          description: "A **single, brief** code snippet (under 10 lines) showing how to use this code."
        }
      },
      required: ["overview", "logicFlow", "functionBreakdown", "usageExample"]
    },
    keyPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "A list of **exactly 3** bullet-point takeaways about the code."
    },
    complexity: { 
      type: "STRING",
      description: "A brief analysis of Time and Space Complexity (e.g., 'Time: O(n), Space: O(1)')"
    },
    improvements: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "A list of the **top 1-2** actionable suggestions for improving the code."
    }
  },
  required: ["commentedCode", "explanationDoc", "keyPoints", "complexity", "improvements"]
};

// --- MOVED CLIENT INIT INSIDE THE FUNCTION ---

export const generateCodeExplanation = async (code, language, fileName) => {
    
    // 1. Check for API Key (This will now run AFTER .env is loaded by the worker)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Make sure your worker loads .env first!");
    }

    // 2. Initialize the client HERE
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", // Use the stable model name
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 8192, 
            responseMimeType: "application/json",
            responseSchema: CodeExplanationSchema // Use the schema we defined above
        }
    });

    const prompt = `
      Analyze the following ${language} code from the file "${fileName}".
      Provide a comprehensive analysis based on the defined JSON schema.
      The 'commentedCode' must be the full original code with added comments.
      The 'explanationDoc' sections must be detailed and high-quality.
      The 'usageExample' must be a valid, runnable code snippet.

      Code:
      ---
      ${code}
      ---
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const text = response.text();
        
        let explanation;
        try {
            explanation = JSON.parse(text);
        } catch (parseError) {
             console.error('Failed to parse the guaranteed JSON response:', parseError, text);
             throw new Error('AI returned an invalid JSON structure despite JSON mode.');
        }
       
        const tokensUsed = response.usageMetadata ? response.usageMetadata.totalTokenCount : 150;

        if (!explanation) {
            throw new Error('AI analysis returned an empty response.');
        }

        return {
            commentedCode: explanation.commentedCode || code,
            explanationDoc: explanation.explanationDoc || { overview: "No overview generated.", logicFlow: "", functionBreakdown: "", usageExample: "" }, 
            keyPoints: explanation.keyPoints || ["Code analyzed"],
            complexity: explanation.complexity || "Not specified",
            improvements: explanation.improvements || ["Review code structure"],
            tokensUsed: tokensUsed
        };
        
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate AI explanation: ' + error.message);
    }
};
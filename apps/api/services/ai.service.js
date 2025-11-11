import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the structured schema for our documentation
// This is the "blueprint" we force the AI to follow.
// In services/ai.service.js

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
          // We are now giving the AI a hard constraint
          description: "A high-level summary. **IMPORTANT: Be concise, 1-2 sentences MAX.**"
        },
        logicFlow: {
          type: "STRING",
          // Asking for bullets is more token-efficient than prose
          description: "A **bulleted list** of the step-by-step logic. **Be brief.**"
        },
        functionBreakdown: {
          type: "STRING",
          // We are limiting the scope of its analysis
          description: "A breakdown of **ONLY the 2-3 most important functions/classes**. Explain parameters & return value. Be concise."
        },
        usageExample: {
          type: "STRING",
          // We are limiting the size of the example
          description: "A **single, brief** code snippet (under 10 lines) showing how to use this code."
        }
      },
      required: ["overview", "logicFlow", "functionBreakdown", "usageExample"]
    },
    keyPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
      // Limiting the number of points
      description: "A list of **exactly 3** bullet-point takeaways about the code."
    },
    complexity: { 
      type: "STRING",
      description: "A brief analysis of Time and Space Complexity (e.g., 'Time: O(n), Space: O(1)')"
    },
    improvements: {
      type: "ARRAY",
      items: { type: "STRING" },
      // Limiting the number of suggestions
      description: "A list of the **top 1-2** actionable suggestions for improving the code."
    }
  },
  required: ["commentedCode", "explanationDoc", "keyPoints", "complexity", "improvements"]
};

// Configure the model to USE our schema and JSON mode
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 8192, 
        responseMimeType: "application/json",
        responseSchema: CodeExplanationSchema 
        }
});

export const generateCodeExplanation = async (code, language, fileName) => {
    
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
        
        // This is now a *guaranteed* valid JSON string
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

        // Return the structured object
        return {
            commentedCode: explanation.commentedCode || code,
            // Pass the whole explanationDoc object
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
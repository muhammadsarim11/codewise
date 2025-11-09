import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
    }
});

function extractJSONFromText(text) {
    try {
        // Try to parse the entire response as JSON first
        return JSON.parse(text);
    } catch (firstError) {
        try {
            // If that fails, try to extract JSON from code blocks
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (secondError) {
            // If extraction fails, create a fallback response
            console.log('Failed to parse JSON, using fallback');
            return null;
        }
    }
    return null;
}

export const generateCodeExplanation = async (code, language, fileName) => {
    const prompt = `
Analyze this ${language} code and provide a code explanation in JSON format.

Code from ${fileName}:
\`\`\`${language}
${code}
\`\`\`

Respond with ONLY valid JSON in this exact format:
{
    "commentedCode": "code with line comments added",
    "explanation": "detailed explanation text", 
    "keyPoints": ["point1", "point2", "point3"],
    "complexity": "time/space complexity",
    "improvements": ["suggestion1", "suggestion2"]
}

Important: Return ONLY the JSON, no other text.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Raw AI response:', text.substring(0, 200) + '...');
        
        const explanation = extractJSONFromText(text);
        
        const tokensUsed = response.usageMetadata ? response.usageMetadata.totalTokenCount : 150;

        // FIX: Handle case where explanation is null/undefined
        if (!explanation) {
            console.log('No valid JSON found in response, using fallback');
            return {
                commentedCode: code,
                explanationText: "AI analysis completed but response format was invalid",
                keyPoints: ["Code analyzed by AI"],
                complexity: "Not specified",
                improvements: ["Review the code structure"],
                tokensUsed: tokensUsed
            };
        }

        // Fix for the JSON issue in the response
        let cleanCommentedCode = explanation.commentedCode || code;
        
        // If commentedCode contains the entire JSON response, extract just the code part
        if (cleanCommentedCode && cleanCommentedCode.includes('```json') && cleanCommentedCode.includes('commentedCode')) {
            try {
                const jsonMatch = cleanCommentedCode.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResponse = JSON.parse(jsonMatch[0]);
                    cleanCommentedCode = parsedResponse.commentedCode || code;
                }
            } catch (e) {
                // If extraction fails, use original code
                cleanCommentedCode = code;
            }
        }

        return {
            commentedCode: cleanCommentedCode,
            explanationText: explanation.explanation || "AI explanation generated",
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
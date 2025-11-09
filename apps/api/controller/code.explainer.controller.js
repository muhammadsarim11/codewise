import { parseUploadedFile } from "../services/file.parser.js";
import { parseRawCodeInput } from "../services/file.parser.js";
import prisma from "../config/prisma.js"
import { generateCodeExplanation } from "../services/ai.service.js";

const generateDummyExplanation = (code, language) => {
  const lines = code.split('\n');
  const commentedCode = lines.map((line, index) => {
    if (line.trim() === '') return line;
    return `${line} // Line ${index + 1}`;
  }).join('\n');

  return {
    commentedCode,
    explanationText: `This ${language} code has ${lines.length} lines.`,
    tokensUsed: 150
  };
};

export const createExplanation = async (req, res) => {
  try {
    let parsedCode;
    
    // FIX: Handle both file upload and form fields properly
    let projectId = req.body?.projectId;
    
    // Check for file upload (Multer puts files in req.files when using .any())
    if (req.files && req.files.length > 0) {
      const file = req.files.find(f => f.fieldname === 'file');
      if (file) {
        parsedCode = parseUploadedFile(file);
      } else {
        return res.status(400).json({
          success: false,
          message: "No file found in upload"
        });
      }
    } 
    // Check for text code in request body
    else if (req.body.code) {
      parsedCode = parseRawCodeInput({
        code: req.body.code,
        language: req.body.language,
        fileName: req.body.fileName
      });
    } 
    else {
      return res.status(400).json({
        success: false,
        message: "Please provide code via file upload or text paste"
      });
    }

    let explanationResult;
    let aiModel = "dummy-v1";

    if (process.env.GEMINI_API_KEY) {
      try {
        explanationResult = await generateCodeExplanation(
          parsedCode.code,
          parsedCode.language,
          parsedCode.fileName
        );
        aiModel = "gemini-2.5-flash";
      } catch (aiError) {
        console.log('AI failed, using dummy:', aiError.message);
        explanationResult = generateDummyExplanation(parCode.code, parsedCode.language);
      }
    } else {
      explanationResult = generateDummyExplanation(parsedCode.code, parsedCode.language);
    }

    // FIX: Use correct Prisma model names (capitalized)
    if (!projectId) {
      const defaultProject = await prisma.Project.create({
        data: {
          name: `Quick Explanations - ${new Date().toLocaleDateString()}`,
          description: 'Auto-created project for code explanations',
          userId: req.user?.id || "temp-user-id"
        }
      });
      projectId = defaultProject.id;
    }

    const explanationRecord = await prisma.CodeExplanation.create({
      data: {
        projectId: projectId,
        fileName: parsedCode.fileName,
        language: parsedCode.language,
        originalCode: parsedCode.code,
        commentedCode: explanationResult.commentedCode,
        explanationText: explanationResult.explanationText,
        tokensUsed: explanationResult.tokensUsed,
        aiModel: aiModel
      }
    });

    const responseData = {
      id: explanationRecord.id,
      explanation: explanationResult.explanationText,
      code: {
        original: parsedCode.code,
        commented: explanationResult.commentedCode
      },
      projectId: projectId,
      aiModel: aiModel,
      tokensUsed: explanationResult.tokensUsed
    };

    if (explanationResult.keyPoints) {
      responseData.keyPoints = explanationResult.keyPoints;
    }
    if (explanationResult.complexity) {
      responseData.complexity = explanationResult.complexity;
    }
    if (explanationResult.improvements) {
      responseData.improvements = explanationResult.improvements;
    }

    return res.status(201).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
import { parseUploadedFile } from "../services/file.parser.js";
import { parseRawCodeInput } from "../services/file.parser.js";
import prisma from "../config/prisma.js"
import { generateCodeExplanation } from "../services/ai.service.js";


export const createExplanation = async (req, res) => {
  try {
    let parsedCode;
    
    
    let projectId = req.body?.projectId;
    
    //
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
    let aiModel ;

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
       
      }
    } 
   
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
        aiModel: aiModel,
        keyPoints: explanationResult.keyPoints || null,
        complexity: explanationResult.complexity || null,
        improvements: explanationResult.improvements || null,
      }
    });

 

    return res.status(201).json({
      success: true,
      data: explanationRecord
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
import { parseUploadedFile } from "../services/file.parser.js";
import { parseRawCodeInput } from "../services/file.parser.js";
import prisma from "../config/prisma.js"
import { generateCodeExplanation } from "../services/ai.service.js";
import { CacheService } from "../services/cache.service.js";



const MAX_CODE_LENGTH = 100000;

export const createExplanation = async (req, res) => {
  try {
    let parsedCode;
    let projectId = req.body?.projectId;

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

    if (!parsedCode.code || parsedCode.code.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Code file is empty or invalid."
        });
    }

    if (parsedCode.code.length > MAX_CODE_LENGTH) {
        console.warn(`Input code from ${parsedCode.fileName} was truncated. Original size: ${parsedCode.code.length}, New size: ${MAX_CODE_LENGTH}`);
        parsedCode.code = parsedCode.code.substring(0, MAX_CODE_LENGTH);
    }

    const aiTask = (async () => {
      if (process.env.GEMINI_API_KEY) {
        try {
          const explanationResult = await generateCodeExplanation(
            parsedCode.code,
            parsedCode.language,
            parsedCode.fileName
          );
        
          return { result: explanationResult, model: "gemini-2.5-flash" };
        } catch (aiError) {
          console.log('AI failed, using dummy:', aiError.message);
      
          throw new Error(`AI Generation Failed: ${aiError.message}`);
        }
      }
      throw new Error("AI service is not configured (GEMINI_API_KEY not set).");
    })();

    const projectTask = (async () => {
      if (projectId) {
        return projectId;
      }
      
      const defaultProject = await prisma.Project.create({
        data: {
          name: `Quick Explanations - ${new Date().toLocaleDateString()}`,
          description: 'Auto-created project for code explanations',
          userId: req.user?.id || "temp-user-id"
        }
      });
      return defaultProject.id; 
    })();

    const [aiData, resolvedProjectId] = await Promise.all([
      aiTask,
      projectTask
    ]);

    const explanationResult = aiData.result;
    const aiModel = aiData.model;
    
    const explanationRecord = await prisma.CodeExplanation.create({
      data: {
        projectId: resolvedProjectId, 
        fileName: parsedCode.fileName,
        language: parsedCode.language,
        originalCode: parsedCode.code,
        commentedCode: explanationResult.commentedCode,
        explanationDoc: explanationResult.explanationDoc,
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

export const getExplanation = async (req, res) => {

  const { id } = req.params
  try {

    // checking if cached already!
    const cachedData = CacheService.get(id)

    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }


    const codeExplanation = await prisma.CodeExplanation.findFirst({

      where: {
        id: id,
        Project: {
          userId: req.user.id
        }
      },
      include: {
        Project: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

     if (!codeExplanation) {
            return res.status(404).json({
                success: false,
                message: "Explanation not found"
            });
        }

    await CacheService.set(codeExplanation.id, codeExplanation)
    return res.status(200).json({
      success: true,
      data: codeExplanation,
      cached: false

    

  })
  } 
  
  catch (error) {
return res.status(400).json({
  success: false,
  message:error.message

  })
  }
}


export const shareExplanation = async (req,res)=>{
  const {id} = req.params
 const UserId = req.user.id

try {
    const codeExplanation = await prisma.CodeExplanation.findFirst({
    where:{
        id:id,
        Project:{
          userId:UserId
        }
    
    }
  })
  
  if(!codeExplanation){
    return res.status(404).json({
      success:false,
      message:"Explanation not found"
    })
  
  }
    
  const updateExplanation = await prisma.codeExplanation.update({
    where:{
      id:id
    },
    data:{
      isPublic:true
    }
    
  })
  
  
  return res.status(200).json({
    success:true,
    message:"shared successfully",
    publicShareId : updateExplanation.publicShareId
  
  })
  
} catch (error) {
  return res.status(400).json({
    success:false,
    message:error.message
  })
}

}


export const getPublicExplanation = async (req,res)=>{
  const {publicShareId} = req.params
try {
  
    const codeExplanation = await prisma.CodeExplanation.findUnique({
      where:{
        publicShareId:publicShareId
      }
    })
  
  if(!codeExplanation){
    return res.status(404).json({
      success:false,
      message:"Explanation not found"
    })
  
  }
  if (!codeExplanation.isPublic) {
      return res.status(404).json({
        success: false,
        message: "Explanation not found" // We give the same error
      });
    }
  return res.status(200).json({
    success:true,
    data:codeExplanation
  })
  
} catch (error) {
  
  return res.status(400).json({
    success:false,
    message:error.message
  })
    
}
}
import { parseUploadedFile } from "../services/file.parser.js";
import { parseRawCodeInput } from "../services/file.parser.js";
import prisma from "../config/prisma.js"
import { explanationQueue } from "../utility/redis.js";
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
const projectTask = (async () => {
      if (projectId) return projectId;
      
      const defaultProject = await prisma.Project.create({
        data: {
          name: `Quick Explanations - ${new Date().toLocaleDateString()}`,
          description: 'Auto-created project for code explanations',
          userId: req.user?.id || "temp-user-id"
        }
      });
      return defaultProject.id; 
    })();

    const resolvedProjectId = await projectTask;
    const explanationRecord = await prisma.CodeExplanation.create({
      data: {
        projectId: resolvedProjectId, 
        fileName: parsedCode.fileName,
        language: parsedCode.language,
        originalCode: parsedCode.code,
        status: "PENDING", 
        commentedCode: "Your explanation is being generated...",
        explanationDoc: {
          overview: "Please wait, your analysis is in the queue.",
          logicFlow: "...",
          functionBreakdown: "...",
          usageExample: "..."
        },
        keyPoints: ["Processing..."],
        complexity: "Processing...",
        improvements: ["Processing..."]
      }
    });


    await explanationQueue.add('process-explanation', {
      explanationId: explanationRecord.id, 
      code: parsedCode.code,                
      language: parsedCode.language,
      fileName: parsedCode.fileName
    },{
      
 
  attempts: 3, 
  backoff: {
    type: 'exponential',
    delay: 5000
  }
  ,
  removeOnComplete: {
      age: 3600, // Keep for 1 hour
      count: 100 // Keep last 100 jobs max
  },
  removeOnFail: {
      age: 24 * 3600 // Keep failed jobs for 24 hours (for debugging)
  }
    });


    return res.status(202).json({
      success: true,
      message: "Explanation job accepted and is being processed.",
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
  const { id } = req.params;
  try {

    // 1. Check Cache
    const cachedData = CacheService.get(id);
  if (cachedData && Object.keys(cachedData).length > 0) {
        return res.json({
            success: true,
            data: cachedData,
            cached: true
        });
    }

    // 2. Fetch from DB
    const codeExplanation = await prisma.CodeExplanation.findFirst({
      where: {
        id: id,
        project: {
          userId: req.user.id
        }
      },
      include: {
        project: {
          select: {
            name: true,
            id: true
          }
        }
      }
    });

    if (!codeExplanation) {
      return res.status(404).json({
        success: false,
        message: "Explanation not found"
      });
    }

  
    if (codeExplanation.status === 'COMPLETED') {
        CacheService.set(codeExplanation.id, codeExplanation);
    }

    return res.status(200).json({
      success: true,
      data: codeExplanation, 
      cached: false
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const shareExplanation = async (req,res)=>{
  const {id} = req.params
 const UserId = req.user.id

try {
    const codeExplanation = await prisma.CodeExplanation.findFirst({
    where:{
        id:id,
        project:{
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
  const shareId = req.params?.shareId
  
try {
  console.log(shareId)
    const codeExplanation = await prisma.CodeExplanation.findUnique({
      where:{
        publicShareId:shareId
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

// Add this new controller function
export const getAllExplanations = async (req, res) => {
  try {
    const userId = req.user.id;
    // We fetch ALL explanations for this user
    const explanations = await prisma.CodeExplanation.findMany({
      where: { 
        project: { userId: userId } // Only fetch what belongs to the user
      },
      orderBy: { createdAt: 'desc' },
      include: { project: true } // Include project name if needed
    });

    return res.status(200).json({
      success: true,
      explanations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
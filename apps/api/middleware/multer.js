import multer from "multer";
import path from "path"


const storage = multer.memoryStorage()

export const allowedExtensions = [
  // JavaScript/TypeScript
  ".js", ".jsx", ".mjs", 
  ".ts", ".tsx",
  
  // Python
  ".py", ".pyw",
  
  // Java
  ".java",
  
  // C/C++ Family
  ".cpp", ".cc", ".cxx", ".c", ".h", ".hpp",
  
  // Web Technologies
  ".html", ".htm", ".css", ".scss", ".sass",
  
  // Other Languages
  ".php", ".rb", ".go", ".rs", ".swift", ".kt", ".scala",
  
  // Configuration & Data
  ".json", ".xml", ".yaml", ".yml"
];

const fileFilter = (req, file, cb) => {
  // Get file extension and convert to lowercase
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  console.log(`Checking file: ${file.originalname}, extension: ${fileExtension}`);
  
  // Check if the extension is in our allowed list
  if (allowedExtensions.includes(fileExtension)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file with an error message
    cb(new Error(`Unsupported file type: ${fileExtension}. Only code files are allowed.`), false);
  }
};

// Use multer with .any() to parse all fields including text fields
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024,
    files: 1
  },
  fileFilter: fileFilter
}).any(); // This parses bo
import path from "path";
import { allowedExtensions } from "../middleware/multer.js";

console.log("✅ File Parser Service loaded with", allowedExtensions.length, "supported file types");

const extToLang = {
  '.js': 'javascript',
  '.jsx': 'javascript', 
  '.mjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.pyw': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.hpp': 'cpp',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.php': 'php',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml'
};

function validateExtensionConsistency() {
  const missingInParser = allowedExtensions.filter(ext => !extToLang[ext]);
  if (missingInParser.length > 0) {
    console.warn('⚠️  WARNING: Some extensions in Multer are missing from Parser language mapping:', missingInParser);
  } else {
    console.log('✅ All Multer extensions are mapped to languages in Parser');
  }
}

validateExtensionConsistency();

export function parseUploadedFile(file) {
  if (!file) {
    throw new Error("No file uploaded. Please select a file to upload.");
  }

  if (!file.buffer) {
    throw new Error("Uploaded file is corrupt or empty. Please try again.");
  }

  const MAX_FILE_SIZE = 200 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes. Maximum size is 200KB.`);
  }

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(fileExtension)) {
    const supportedTypes = allowedExtensions.map(ext => ext.slice(1)).join(', ');
    throw new Error(
      `Unsupported file type: ${fileExtension}. Supported types: ${supportedTypes}`
    );
  }

  const language = extToLang[fileExtension];
  if (!language) {
    throw new Error(`Language mapping missing for extension: ${fileExtension}`);
  }

  let codeContent;
  try {
    codeContent = file.buffer.toString('utf8').trim();
  } catch (error) {
    throw new Error("Failed to read file content. The file may be corrupted.");
  }

  if (!codeContent) {
    throw new Error("File content is empty. Please upload a file with code content.");
  }

  return {
    code: codeContent,
    language: language,
    fileName: file.originalname,
    size: file.size,
    extension: fileExtension
  };
}

export function parseRawCodeInput(input) {
  if (!input || !input.code || typeof input.code !== 'string') {
    throw new Error("Code text is required. Please paste your code in the text area.");
  }

  const cleanCode = input.code.trim();
  
  if (!cleanCode) {
    throw new Error("Code is empty. Please provide some code to analyze.");
  }

  const MAX_CODE_SIZE = 200 * 1024;
  const codeSize = Buffer.byteLength(cleanCode, 'utf8');
  if (codeSize > MAX_CODE_SIZE) {
    throw new Error(`Code too large: ${codeSize} bytes. Maximum size is 200KB.`);
  }

  const language = input.language || 'javascript';
  const fileName = input.fileName || `code-${Date.now()}.txt`;

  return {
    code: cleanCode,
    language: language.toLowerCase(),
    fileName: fileName,
    size: codeSize
  };
}

export function getSupportedLanguages() {
  return {
    extensions: allowedExtensions,
    languages: [...new Set(Object.values(extToLang))],
    mapping: extToLang
  };
}

export function detectLanguageFromFileName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return extToLang[ext] || 'unknown';
}


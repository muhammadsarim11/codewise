import { Worker } from "bullmq"; // Removed unused 'tryCatch'
import IORedis from "ioredis";
import { generateCodeExplanation } from "./services/ai.service.js";
import prisma from "./config/prisma.js"; // FIXED: Path (assuming worker is in root)
import 'dotenv/config';
// 1. Redis Connection
const connection = new IORedis({
  host: 'redis-10490.c285.us-west-2-2.ec2.cloud.redislabs.com',
    port: 10490,
    username: 'default',
    password: 'po58FG7Huco4FMDUCHIjcVPy8gQorUYD',
    lazyConnect: true,
  skipConfigValidation: true,
   // ⚠️ TODO: Move this to .env file!
  maxRetriesPerRequest: null,
  family: 0, // 👈 YEH BOHOT ZAROORI HAI: Forces IPv4 instead of IPv6
  enableReadyCheck: false
});
console.log("📍 Current Directory:", process.cwd());
console.log("🔑 GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "LOADED ✅" : "MISSING ❌");
console.log('👷 Worker is starting... Listening for "explanation-jobs" on Redis...');

const worker = new Worker('explanation-jobs', async (job) => {

  console.log(`⚡ Processing Job #${job.id} for Explanation ID: ${job.data.explanationId}`);

  // FIXED: Moved OUTSIDE the try block so 'catch' can see explanationId
  const { explanationId, code, language, fileName } = job.data;

  try {
    // 2. The Slow AI Work
    const explanationResult = await generateCodeExplanation(
      code,
      language,
      fileName
    );

    // 3. Update Database
    // FIXED: Changed 'prisma.code' to 'prisma.CodeExplanation'
    await prisma.CodeExplanation.update({
      where: {
        id: explanationId
      },
      data: {
        commentedCode: explanationResult.commentedCode,
        explanationDoc: explanationResult.explanationDoc,
        keyPoints: explanationResult.keyPoints || [],
        complexity: explanationResult.complexity || null,
        improvements: explanationResult.improvements || [],
        aiModel: "gemini-2.5-flash",
        tokensUsed: explanationResult.tokensUsed,
        status: 'COMPLETED' // FIXED: Changed 'SUCCESS' to 'COMPLETED'
      }
    });

    console.log(`✅ Job #${job.id} Completed!`);

  } catch (error) {
    console.error(`❌ Job #${job.id} FAILED:`, error.message);

    // 4. Handle Errors
    // Now this works because 'explanationId' is defined outside the try block
    await prisma.CodeExplanation.update({
      where: { id: explanationId },
      data: {
        status: 'FAILED',
        commentedCode: `Error generating explanation: ${error.message}`
      }
    });

    throw error;
  }

}, { connection });

worker.on('ready', () => console.log('🚀 Worker is ready and connected!'));
worker.on('error', err => console.error('⚠️ Worker connection error:', err));
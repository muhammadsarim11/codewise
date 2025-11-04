import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

export default defineConfig({
  schema: "./prisma/schema.prisma", // ✅ path now relative to THIS folder
  migrations: {
    path: "./prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

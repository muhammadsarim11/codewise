CodeWise 🚀AI-Powered Code Analysis & Optimization PlatformCodeWise is a full-stack SaaS application designed to help developers understand, optimize, and document their code instantly. By leveraging Google's Gemini AI, it breaks down complex logic, analyzes time complexity, and suggests modern refactoring techniques—all within a sleek, developer-friendly interface.✨ Key Features🤖 Deep AI Analysis: Upload files or paste snippets to get line-by-line logic breakdowns and complexity (Big O) analysis.⚡ Asynchronous Processing: Heavy AI tasks are handled via Redis Queues (BullMQ) to ensure a non-blocking, snappy user experience.📂 Project Management: Organize your snippets into dedicated projects with full CRUD capabilities.🔗 Secure Sharing: Generate public, read-only links for your analysis reports to share with teammates.📄 PDF Export: Download professional analysis reports for documentation.💻 Monaco Editor: A fully functional, VS Code-like editor embedded right in the browser.🔐 Secure Auth: Custom JWT-based authentication with secure HTTP-only cookies and OTP password recovery.🛠️ Tech StackArchitecture: Monorepo (TurboRepo)Frontend (apps/web):Framework: Next.js 14 (App Router)Styling: Tailwind CSS, Framer MotionState/API: React Hooks, AxiosEditor: Monaco EditorBackend (apps/api):Runtime: Node.jsFramework: Express.jsDatabase: PostgreSQL (via Prisma ORM)Queue System: Redis & BullMQAI Model: Google Gemini ProInfrastructure:Frontend: VercelBackend: RenderDatabase: Supabase / Neon (PostgreSQL)Cache: Redis Cloud🚀 Getting StartedFollow these steps to run CodeWise locally.PrerequisitesNode.js (v18+)npm or yarnRedis (running locally or via cloud URL)PostgreSQL Database1. Clone the Repositorygit clone [https://github.com/yourusername/codewise.git](https://github.com/yourusername/codewise.git)
cd codewise
2. Install DependenciesSince this is a monorepo, install dependencies from the root:npm install
3. Environment SetupCreate .env files in both apps/web and apps/api.Backend (apps/api/.env):PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/codewise"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_super_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
GEMINI_API_KEY="your_google_gemini_key"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
CLIENT_URL="http://localhost:3000"
Frontend (apps/web/.env.local):NEXT_PUBLIC_API_URL="http://localhost:5000"
4. Database SetupInitialize the database using Prisma:# Navigate to backend
cd apps/api
npx prisma generate
npx prisma db push
5. Run the App (Dev Mode)You can run both frontend and backend concurrently from the root:# From root directory
npm run dev
Frontend: http://localhost:3000Backend: http://localhost:5000📂 Project Structurecodewise/
├── apps/
│   ├── web/             # Next.js Frontend
│   │   ├── app/         # App Router Pages
│   │   └── components/  # UI Components
│   └── api/             # Express Backend
│       ├── controller/  # Logic & Request Handling
│       ├── routes/      # API Endpoints
│       ├── worker/      # Queue Processors
│       └── prisma/      # Database Schema
└── package.json         # Root configuration
🤝 ContributingContributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.
Developed with ❤️ by muhammad sarim khan

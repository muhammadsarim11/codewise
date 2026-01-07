
# CodeWise 🚀  
### AI-Powered Code Analysis & Optimization Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-BullMQ-red)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

**CodeWise** is a production-grade full-stack SaaS platform that helps developers **understand, optimize, and document code instantly**.  
Using **Google Gemini AI**, it provides deep logic explanations, time-complexity analysis, and modern refactoring suggestions — all inside a fast, VS Code-like experience.

> Built with scalability, performance, and real-world SaaS architecture in mind.

---

## ✨ Key Features

- 🤖 **AI-Powered Code Understanding**  
  Line-by-line explanations with Big-O complexity analysis.

- ⚡ **Async Job Processing**  
  AI tasks run in background queues using **Redis + BullMQ** for non-blocking UX.

- 📂 **Project-Based Organization**  
  Manage multiple projects with complete CRUD operations.

- 🔗 **Secure Shareable Reports**  
  Public, read-only links for team collaboration.

- 📄 **Professional PDF Export**  
  One-click downloadable documentation.

- 💻 **Monaco Editor Integration**  
  Full VS Code-like editor in the browser.

- 🔐 **Enterprise-Grade Authentication**  
  JWT + HTTP-only cookies, refresh tokens, and OTP-based recovery.

---

## 🧠 Why CodeWise?

Most tools only *format* or *lint* code.  
**CodeWise explains it.**

- Ideal for **learning complex codebases**
- Perfect for **documentation & onboarding**
- Built for **modern AI-assisted development workflows**

---

## 🛠️ Tech Stack

### 🏗 Architecture
- **Monorepo** (TurboRepo)

### 🌐 Frontend (`apps/web`)
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion
- Axios
- Monaco Editor

### 🔙 Backend (`apps/api`)
- Node.js
- Express.js
- PostgreSQL (Prisma ORM)
- Redis + BullMQ
- Google Gemini Pro

### ☁ Infrastructure
- Frontend: **Vercel**
- Backend: **Render**
- Database: **Supabase / Neon**
- Cache & Queues: **Redis Cloud**




## 🚀 Getting Started

### ✅ Prerequisites

* Node.js (v18+)
* npm or yarn
* Redis
* PostgreSQL

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/codewise.git
cd codewise
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Environment Variables

#### Backend (`apps/api/.env`)

```env
PORT=5000
DATABASE_URL="postgresql://user:pass@localhost:5432/codewise"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_super_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
GEMINI_API_KEY="your_google_gemini_key"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
CLIENT_URL="http://localhost:3000"
```

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

---

### 4️⃣ Database Setup

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

---

### 5️⃣ Run Development Server

```bash
npm run dev
```

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend → [http://localhost:5000](http://localhost:5000)

---

## 📦 Production Deployment

### Frontend (Vercel)

* Root: `apps/web`
* Environment variable:

  * `NEXT_PUBLIC_API_URL`

### Backend (Render)

* Root: `apps/api`
* Add all `.env` variables
* Enable Redis instance

---

## 📂 Project Structure

```
codewise/
├── apps/
│   ├── web/
│   └── api/
├── packages/
├── turbo.json
└── package.json
```

---

## 🤝 Contributing

Pull requests are welcome.
For major changes, open an issue first to discuss improvements.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Muhammad Sarim**
Full-Stack Developer | SaaS Builder | Instructor

> Built with real-world scalability, not tutorials.

```

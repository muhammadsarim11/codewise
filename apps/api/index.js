import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import userRoutes from './router/User.routes.js';
import projectRoutes from './router/Project.routes.js';
import aiRoutes from './router/ai.codeExplanation.routes.js';
import bodyParser from 'body-parser';
import cors from 'cors'

const app = express();



app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  
}))

app.use(bodyParser.json());

app.use(express.json());
app.use(cookieParser());




app.use("/", aiRoutes)
app.use("/projects",projectRoutes)
app.use("/",userRoutes)




app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

const PORT = process.env.PORT || 5000; // Use Render's PORT or fallback to 5000 locally

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
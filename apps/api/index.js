import express from 'express'
import cookieParser from 'cookie-parser';
import userRoutes from './router/User.routes.js';
const app = express();


app.use(express.json());
app.use(cookieParser());



app.use("/",userRoutes)


app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

app.listen(5000, () => console.log("Server running on port 5000"));

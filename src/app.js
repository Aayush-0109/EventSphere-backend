import express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());
app.use("/api/v1/auth",authRoutes);

  

app.get("/",(req,res)=>{
    res.send("Hello World");
})



export { app};
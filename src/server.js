
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
dotenv.config();
import {app} from "./app.js";
import redis from "./config/redis.js";
const PORT = process.env.PORT || 8000;
 

connectDB().then(() => {
    app.on("error", (err) => {
        console.log(err);
 
    });  
   redis.ping().then(()=>{
    console.log("Redis connected")
   }).catch((err)=>{
      console.log(err)
      process.exit(1)
   })
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);

       
    });
    app.on("close", () => console.log("Server closed"));
}).catch((err) => {
    console.log(err);
    process.exit(1);
})



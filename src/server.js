
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
dotenv.config();
import {app} from "./app.js";
const PORT = process.env.PORT || 8000;
 

connectDB().then(() => {
    app.on("error", (err) => {
        console.log(err);
 
    });  

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);

       
    });
    app.on("close", () => console.log("Server closed"));
}).catch((err) => {
    console.log(err);
    process.exit(1);
})

// import dotenv from "dotenv";
// import {app} from "./app.js";
// import { connectDB } from "./config/connectDB.js";
//  dotenv.config();
//     const PORT =  8000;

 
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);

// });

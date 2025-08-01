import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import eventBookingRoutes from "./routes/eventBooking.routes.js";
import { notfound, errorHandler } from "./middlewares/error.middleware.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/bookings", eventBookingRoutes);

app.use(notfound);
app.use(errorHandler);



export { app };
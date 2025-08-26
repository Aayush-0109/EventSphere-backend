import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import eventBookingRoutes from "./routes/eventBooking.routes.js";
import organizerRequestRoutes from "./routes/organizerRequest.routes.js";
import userRoutes from "./routes/user.routes.js";
import { notfound, errorHandler } from "./middlewares/error.middleware.js";
const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/bookings", eventBookingRoutes);
app.use("/api/v1/organizer-request", organizerRequestRoutes);
app.use("/api/v1/users", userRoutes);
app.use(notfound);
app.use(errorHandler);



export { app };
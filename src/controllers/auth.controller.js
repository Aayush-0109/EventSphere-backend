import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { prisma } from "../config/connectDB.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const generateToken = async (user) => {
    
    try {
        const accessPayload = {
            id: user.id,
            role: user.role,
            name: user.name
        }
        const refreshPayload = {
            id: user.id,
            role: user.role
        }
        const refreshToken =  jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY   })
        const accessToken =  jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error in generating token");
    }

}

const registerUser = asyncHandler(async (req, res, next) => {
    // get data from body
    const { name, email, password } = req.body;
    if (!name) throw new ApiError(400, "Name is required");
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    // hash password
    const hashedPassword = bcrypt.hashSync(password.trim(), 10);

    // upload image to cloudinary
    const imagePath = req.file?.path;
    let profileImage = null;
    if (imagePath) {
        const image = await uploadOnCloudinary(imagePath);
        if (!image) throw new ApiError(400, "Failed to upload image to cloudinary");
        profileImage = image.url;
    }

    // create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profileImage: profileImage

        }
    })
    if (!user) throw new ApiError(400, "Failed to create user");
    const createdUser = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true
        }
    })

    res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )

}, "registerUser")

const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password are required");
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!user) throw new ApiError(400, "User not found");
    if (!bcrypt.compareSync(password.trim(), user.password)) throw new ApiError(400, "Invalid password");
    const { accessToken, refreshToken } = await generateToken(user);
    const updatedUser = await prisma.user.update(
        {
            where: { email: email },
            data: {
                refreshToken: refreshToken
            },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                role: true
            }
        }
    )
    // cookie
    const cookieOption = {
        httpOnly: true,
        secure: true
    }
    res.cookie("refreshToken", refreshToken,cookieOption)
    .cookie("accessToken",accessToken,cookieOption)
    .status(200).json(
        new ApiResponse(200, updatedUser, "User logged in successfully")
    )





}, "loginUser")

export { registerUser,loginUser }
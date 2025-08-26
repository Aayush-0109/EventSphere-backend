import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { prisma } from "../config/connectDB.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import otpService from '../services/otp.service.js'


// Cookie settings: cross-site requires SameSite=None and Secure
const isProd = process.env.NODE_ENV === 'production'
const secureFlag = (process.env.COOKIE_SECURE === 'true') || isProd
const sameSiteValue = (process.env.COOKIE_SAMESITE) || (secureFlag ? 'none' : 'lax')
const cookieOption = {
    httpOnly: true,
    secure: secureFlag,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: sameSiteValue
}


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
        const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
        const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Error in generating token");
    }

}

const registerUser = asyncHandler(async (req, res, next) => {

    const { name, email, password } = req.body;







    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }


    const hashedPassword = bcrypt.hashSync(password.trim(), 10);


    const file = req.file;
    let profileImage = null;
    console.log(file);
    if (file) {
        const image = await uploadOnCloudinary(file, {
            folder: "users",
            resource_type: "image"
        });
        if (!image) throw new ApiError(500, "Failed to upload image to cloudinary");
        console.log(image)
        profileImage = {
            url: image.url,
            publicId: image.public_id
        }
    }


    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profileImage: profileImage

        }
    })
    if (!user) throw new ApiError(500, "Failed to create user");
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
    createdUser.profileImage = createdUser.profileImage?.url || null;
    res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    )

}, "registerUser")

const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.validatedQuery;
    otpService.sendOtp(email);
    res.status(200).json(new ApiResponse(201, {}, "Otp sent successfully"))
}, "send otp")

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.validatedQuery;
    const success = await otpService.verifyOtp(email, otp);
    if (!success) throw new ApiError(400, " OTP verification failed")
    res.status(200).json(new ApiResponse(200, {}, "Otp verified successfully"))
}, "verify otp")

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!user) throw new ApiError(404, "User not found");
    if (!bcrypt.compareSync(password.trim(), user.password)) throw new ApiError(401, "Invalid password");
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
    updatedUser.profileImage = updatedUser.profileImage?.url || null;
    res.cookie("refreshToken", refreshToken, cookieOption)
        .cookie("accessToken", accessToken, cookieOption)
        .status(200).json(
            new ApiResponse(200, updatedUser, "User logged in successfully")
        )





}, "login User")

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken
    if (!incomingRefreshToken) throw new ApiError(400, "Access token required")
    const payload = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const id = payload.id;
    const user = await prisma.user.findUnique({
        where: {
            id: id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            refreshToken: true,
        }
    })
    if (!user) throw new ApiError(404
        , "Invalid request : No user found");

    if (user.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Unauthenticated request ");
    const accessPayload = {
        id: user.id,
        role: user.role,
        name: user.name
    }
    const refreshPayload = {
        id: user.id,
        role: user.role
    }
    const refreshToken = jwt.sign(refreshPayload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
    const accessToken = jwt.sign(accessPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })

    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken: refreshToken
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    })

    res.status(200).cookie("refreshToken", refreshToken, cookieOption).cookie("accessToken", accessToken, cookieOption).json(new ApiResponse(200, updatedUser, "Access token refreshed successfully"))

}, "refresh access token")

const getUser = asyncHandler(async (req, res) => {
    console.log("inside");

    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profileImage: true,
        }
    })
    user.profileImage = user.profileImage?.url
    res.status(200).json(new ApiResponse(200, user, "user fetched successfully"))
}, "Get user info")

const logOutUser = asyncHandler(async (req, res) => {

    const user = req.user;
    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken: null
        }
    })
    if (!updatedUser) throw new ApiError(500, "Failed to logout user")
    res.clearCookie("refreshToken", cookieOption)
        .clearCookie("accessToken", cookieOption)
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"))


}, "Logout User")

const updateUser = asyncHandler(async (req, res) => {
    const user = req.user;
    const { name, password } = req.body;

    if ((name && name == user.name)) throw new ApiError(409, "Name could not be same as previous one");
    if ((password && password == user.password)) throw new ApiError(409, "Password could not be same as previous one");
    const data = {
        ...(name && { name }),
        ...(password && {
            password: bcrypt.hashSync(password.trim(), 10)
        })
    }
    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            role: true
        }
    })
    if (!updatedUser) throw new ApiError(500, "Failed to update user");
    updatedUser.profileImage = updatedUser.profileImage?.url || null;
    res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));

}, "Update user")
export { registerUser, loginUser, getUser, logOutUser, updateUser, refreshAccessToken, sendOtp, verifyOtp }
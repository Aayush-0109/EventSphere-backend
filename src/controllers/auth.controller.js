import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { prisma } from "../config/connectDB.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// cookie option
const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000
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
    console.log(imagePath);
    if (imagePath) {
        const image = await uploadOnCloudinary(imagePath, {
            folder: "users",
            resource_type: "image"
        });
        if (!image) throw new ApiError(400, "Failed to upload image to cloudinary");
        console.log(image)
        profileImage = {
            url: image.url,
            publicId: image.public_id
        }
    }
    console.log(profileImage);
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
    createdUser.profileImage = createdUser.profileImage?.url || null;
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
    updatedUser.profileImage = updatedUser.profileImage?.url || null;
    res.cookie("refreshToken", refreshToken, cookieOption)
        .cookie("accessToken", accessToken, cookieOption)
        .status(200).json(
            new ApiResponse(200, updatedUser, "User logged in successfully")
        )





}, "loginUser")

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
    if (!updatedUser) throw new ApiError(400, "Failed to logout user")
    res.clearCookie("refreshToken", cookieOption)
        .clearCookie("accessToken", cookieOption)
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"))


}, "Logout User")

const updateUser = asyncHandler(async (req, res) => {
    const user = req.user;
    const { name, password } = req.body;
    if (!name && !password) throw new ApiError(400, "One or more fields are required");
    if (name == user.name && password == user.password) throw new ApiError(400, "No changes made");
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
    if (!updatedUser) throw new ApiError(400, "Failed to update user");
    updatedUser.profileImage = updatedUser.profileImage?.url || null;
    res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));

}, "Update user")
export { registerUser, loginUser, logOutUser, updateUser }
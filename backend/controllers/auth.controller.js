import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { generateTokenandSetCookie } from "../utils/generateTokenandSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email.js";

export const signup = async (req, res) => {
    const { email, password, username } = req.body
    
    try{
        if(!email || !password || !username){
            throw new Error('All fields are required')
        }

        const userAlreadyExists = await User.findOne({ email })
        if(userAlreadyExists){
            return res.status(400).json({success: false, message: "User already exists"}) 
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

        const user = new User({
            email,
            password: hashedPassword,
            username,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })  

        await user.save()

        //jwt token 
        generateTokenandSetCookie(res, user._id)

        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user:{
                ...user._doc,
                password: undefined
            } 
        })
    } catch (error) {
        res.status(400).json({success: false, message: error.message})
        console.log(error);
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if(!user){
            res.status(400).json({ success: fasle, message: "Invalid or expired verification code"})
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.username)

        res.status(200).json({
            success: true, 
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log('Error in verifying email', error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            })
        }
        const isPassword = await bcrypt.compare(password, user.password)
        if(!isPassword){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        generateTokenandSetCookie(res, user._id)

        user.lastLogin = new Date()
        await user.save()

        res.status(200).json({
            success: true,
            message: "Logged In successfully",
            user:{
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log('Error in login', error);
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token")
    res.status(200).json({
        success: true,
        message: "Logout successfully"
    })
}
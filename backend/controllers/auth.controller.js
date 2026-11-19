import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { upsertStreamUser } from '../lib/stream.js';

export async function signUp(req, res) {
    const {email, password, fullName} = req.body;
    try {
        
        if(!email || !password || !fullName){
            return res.status(400).json({message:"All field are missing"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"password must be atleast 6 characters "})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        const idx = Math.floor(Math.random() * 100)+1; 
        const randomAvatar = `https://avatars.iran.liara.run/public${idx}.png`;
        

        const newUser = new User({
            email,
            password,
            fullName,
            profilePic: randomAvatar
        });

        try{
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            })
            console.log(`Stream user created for ${newUser.fullName}`);
        } catch(error){
            console.error("Error creating Stream user:", error);
        }


        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        

        
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' ,secure:process.env.NODE_ENV==="production"}); // Set cookie for 7 days

        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        res.json({ message: "Error creating user", error: error.message });
    }
}

export async function login(req, res) {
    const {email, password} = req.body;
    try {
        if(!email || !password){
            return res.status(400).json({message:"All field are missing"});
        }
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'strict' ,secure:process.env.NODE_ENV==="production"}); // Set cookie for 7 days
        res.status(200).json({ message: "User logged in successfully", token });
    } catch (error) {
        res.json({ message: "Error logging in", error: error.message });
    }
}
export async function logout(req, res) {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: "User logged out successfully" });
}

export async function onboard(req,res){
    try{
        const userId = req.user._id;
        const {fullName,bio, nativeLanguage, learningLanguage, location} = req.body;
        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({
                message:"All fields are required for onboarding",
                missingFields:[
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)
            })
        } 
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
            ...req.body,
            isOnboarded: true,
            },
        { new: true }
        );
        if(!updatedUser){
            return res.status(404).json({ message: "User not found" });
        }

        try{
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            })
            console.log(`Stream user updated for ${updatedUser.fullName}`);
        }catch (streamError){
            console.error("Error updating Stream user:", streamError.message);
        }

        res.status(200).json({ message: "User onboarded successfully", user: updatedUser });
    } catch(error){
        console.error("Error in onboard function:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
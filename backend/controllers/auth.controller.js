import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
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

        const idx = Math.floor(Math.random() * 100)+1; //generate a num btween 1-100

        const randomAvatar = `https://avatars.iran.liara.run/public${idx}.png`;
        

        const newUser = new User({
            email,
            password,
            fullName,
            profilePic: randomAvatar
        });

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
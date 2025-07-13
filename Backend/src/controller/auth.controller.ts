import { Request, Response } from "express";
import { Auth, IAuth } from "../models/auth.model.js";

export const CreateUser = async (req: Request, res: Response): Promise<any> => {
    try{
        const { username , password, email, role , securityCode } = req.body;
        if(!username && !password && !email){  
            return res.status(400).json({ message: 'All fields are required' });
        }

        if(role === "admin"){
            if(!securityCode){
                return res.status(400).json({ message: 'To Login as Admin you need Admin security code' });
            }
        }

        const existingUser = await Auth.findOne({ username });
        if(existingUser){
            return res.status(400).json({ message: 'Username already exists' });
        }


        const newUser = await Auth.create({
            username,
            password,
            email,
            role: role || 'user',
            securityCode: securityCode || null
        })

        if(!newUser){
            return res.status(500).json({ message: 'Failed to create user' });
        }

        res.status(201).json({ message: 'User created successfully', user: newUser });
    }catch(error: any){
        console.error(`Error creating user: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}



export const UserLogin = async(req: Request , res: Response): Promise<any> => {
    try {
        const {email, username , password} = req.body 
        if(!email || !username && !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await Auth.findOne({ 
            $or: [{email}, {username}] 
        }) as IAuth;
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await user.isPasswordValid(password)
        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = await user.generateJWToken();
        if(!token) {
            return res.status(500).json({ message: 'Failed to generate token' });
        }

        const options: {
            expires: Date;
            httpOnly: boolean;
            secure: boolean;
            sameSite: 'strict' | 'lax' | 'none';
        } = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        }

        return res
        .cookie('token', token, options)
        .status(200)
        .json({ message: 'Login successful', token, user});

    } catch (error: string | any) {
        console.error(`Error creating user: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}
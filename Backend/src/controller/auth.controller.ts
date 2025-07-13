import { Request, Response } from "express";
import { Auth } from "../models/auth.model.js";

export const CreateUser = async (req: Request, res: Response) => {
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



export const UserLogin = async(req: Request , res: Response) => {
    try {
        const {email, username , password} = req.body 
        if(!email || !username && !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await Auth.findOne({ 
            $or: [{email}, {username}] 
        });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await user.isPasswordValid(password)


    } catch (error: string | any) {
        console.error(`Error creating user: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}
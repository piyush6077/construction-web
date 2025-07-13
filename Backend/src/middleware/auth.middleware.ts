import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { IAuth } from '../models/auth.model';
dotenv.config();

declare global {
    namespace Express {
      interface Request {
        user?: IAuth;
      }
    }
}

export const protectedRoute = async (req: Request, res: Response , next: NextFunction): Promise<any> => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const decodedToken = jwt.verify(token , process.env.JWT_SECRET!) as JwtPayload;
        if (!decodedToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        const user = await decodedToken.findById(decodedToken._id ).select('-password') as IAuth ;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    
        req.user = user;
        next();

    } catch (error: string | any) {
        console.error(`Error in protected route: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}
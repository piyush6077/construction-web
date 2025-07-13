import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface IAuth extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    password: string;
    email: string;
    role: 'admin' | 'user';
    comparePassword(candidatePassword: string): Promise<boolean>;
    securityCode?: string | null
    generateJWToken(): Promise<string>;
}

const authSchema: Schema<IAuth> = new Schema<IAuth>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    securityCode: {
        type: String
    }
})

authSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

authSchema.methods.isPasswordValid = async function(password: string) {
    return bcrypt.compare(password, this.password);
};


authSchema.methods.generateJWToken = async function(this: IAuth): Promise<string> {
    const payload = jwt.sign(
    {
        _id: this._id,
        username: this.username,
        role: this.role
    }, 
    process.env.JWT_SECRET as string, 
    {expiresIn: '1h'}
    );
    if (!payload) {
        throw new Error("Failed to generate JWT token");
    }
    return payload;
}

export const Auth: Model<IAuth> = mongoose.model<IAuth>('Auth', authSchema);
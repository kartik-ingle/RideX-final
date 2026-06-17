import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

type VideoKycStatus = "not_required" | "pending" | "in_progress" | "approved" | "rejected"

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" | "partner" | "admin";
    isEmailVerified?: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    partnerOnBoardingSteps: number
    mobileNumber?: string
    partnerStatus?: "pending" | "approved" | "rejected",
    rejectionReason?: string
    videoKycStatus: VideoKycStatus
    videoKycRoomId: string
    videoKycRejectionReason?: string 
    socketId: string | null
    location?: {
        type: "Point",
        coordinates: [number, number]
    }  
    isOnline: boolean
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "partner", "admin"],
        default: "user"
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    partnerOnBoardingSteps: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    mobileNumber: {
        type: String
    },
    partnerStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    },
    videoKycStatus: {
        type: String,
        enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
        default: "not_required"
    },
    videoKycRoomId: {
        type: String
    },
    videoKycRejectionReason: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    }, 
    socketId: {
        type: String,
        default: null
    },
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number],
        }
    },
    isOnline: {
        type: Boolean,
        default: false, 
        index: true
    }
}, { timestamps: true })

userSchema.index({location:"2dsphere"})

userSchema.methods.comparePassword = async function (candidate: string) {
    if (!this.password) return false
    return bcrypt.compare(candidate, this.password)
}

const User = mongoose.models.User || mongoose.model("User", userSchema)
export default User

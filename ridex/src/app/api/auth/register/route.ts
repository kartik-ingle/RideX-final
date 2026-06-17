import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {name, email, password} = await req.json()
        if(!name || !email || !password) {
            return NextResponse.json(
                {message: "All fields required"},
                {status: 400}
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        await connectDb()
        let user = await User.findOne({email})

        if(user && user.isEmailVerified) {
            return NextResponse.json(
                {message: "Email already exists"}, 
                {status: 400}
            )
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiresAt = new Date(Date.now() + 10*60*1000)

        const  hashedPassword = await bcrypt.hash(password, 12)

        if(user && !user.isEmailVerified) {
            user.name = name
            user.password = hashedPassword
            user.email = email
            user.otp = otp
            user.otpExpiresAt = otpExpiresAt
            user.save()
        } else {
            user = await User.create({
                name, email, password: hashedPassword, otp, otpExpiresAt
            })
        }

        await sendMail(
            email, "your otp for email verification",
            `<h2>Your OTP for Email Verification is <strong>${otp}</strong></h2>` 
        )

        return NextResponse.json(
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }, 
            {status: 201}
        )
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { message: "Email already exists" },
                { status: 400 }
            );
        }

        console.error("Register Error:", error);

        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
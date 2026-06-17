import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { sendMail } from "@/lib/sendMail";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const {bookingId} = await req.json()
        const booking = await Booking.findById(bookingId).populate("user")
        if(!booking) {
            return NextResponse.json(
                {message: "booking not found"}, 
                {status: 400}
            )
        }

        const otp = Math.floor(1000 + Math.random()*9000).toString()
        booking.dropOtp = otp
        booking.dropOtpExpires = new Date(Date.now() + 5*60*1000) // OTP expires in 5 minutes
        await booking.save()

        if(booking.user.email) {
            await sendMail(booking.user.email, "Your drop OTP - Ridex",
                `<div style = "font-family:sans-serif; padding: 20px">
                    <h2>Ride OTP</h2>

                    <p>Your drop OTP is:</p>

                    <h1 style = "letter-spacing:6px">${otp}</h1>

                    <p>This OTP is valid for 5 minutes.</p>

                    <p>Share this OTP with your driver to complete the ride.</p>

                    <br/>

                    <b>RIDEX</b>
                </div>`
            )
        }

        return NextResponse.json(
            {message: "drop OTP sent successfully"}, 
            {status: 200}
        )
        
    } catch (error) {
        return NextResponse.json(
            {message: "drop otp error", error},
            {status: 500}
        )
    }
}
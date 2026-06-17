import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { sendMail } from "@/lib/sendMail";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const {bookingId, otp} = await req.json()
        const booking = await Booking.findById(bookingId).populate("user")
        if(!booking) {
            return NextResponse.json(
                {message: "booking not found"}, 
                {status: 400}
            )
        }

        if(!booking.pickUpOtp) {
            return NextResponse.json(
                {message: "pickup OTP not generated"}, 
                {status: 400}
            )
        }

        if(booking.pickUpOtp !== otp) {
            return NextResponse.json(
                {message: "invalid pickup OTP"}, 
                {status: 400}
            )
        }

        if(new Date() > booking.pickUpOtpExpires) {
            return NextResponse.json(
                {message: "pickup OTP expired"}, 
                {status: 400}
            )
        }

        booking.bookingStatus = "started"
        booking.pickUpOtp = ""
        booking.pickUpOtpExpires = undefined
        await booking.save()

        return NextResponse.json(
            {message: "pickup OTP verified successfully"}, 
            {status: 200}
        )
        
    } catch (error) {
        return NextResponse.json(
            {message: "pickup otp verify error", error},
            {status: 500}
        )
    }
}
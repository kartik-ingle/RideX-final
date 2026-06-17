
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Booking from "@/models/booking.model";
import Vehicle from "@/models/vehicle.model";
console.log(Vehicle)
import mongoose from "mongoose";

export async function GET() {
    try {
        await connectDb()
        const session = await auth()
        if(!session || !session.user?.email) {
            return NextResponse.json({message: "Unauthorized"}, {status: 400})
        }

        const user = await User.findOne({email: session.user.email})
        if(!user) {
            return NextResponse.json({message: "Unauthorized"}, {status: 400})
        }

        console.log("USER", user._id)
        const booking = await Booking.findOne({
            
            driverId: user._id,
            bookingStatus: {$in: ["confirmed", "started", "completed"]}
        }).populate("user vehicle driver")
        console.log("BOOKING", booking)
        return NextResponse.json(
            booking, 
            {status: 200}
        )
    } catch (error) {
        return NextResponse.json(
            {message: `get active ride for partner error ${error}`}, 
            {status: 500}
        )
    }
}
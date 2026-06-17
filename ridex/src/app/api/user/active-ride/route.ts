
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Booking from "@/models/booking.model";
import Vehicle from "@/models/vehicle.model";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        if(!session || !session.user?.email) {
            return NextResponse.json({message: "Unauthorized"}, {status: 400})
        }

        const {bookingId} = await req.json()
        const booking = await Booking.findById(bookingId).populate("user vehicle driver")
        return NextResponse.json(
            booking, 
            {status: 200}
        )
    } catch (error) {
        return NextResponse.json(
            {message: `get active ride for user error ${error}`}, 
            {status: 500}
        )
    }
}
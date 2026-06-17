import { NextRequest, NextResponse } from "next/server"
import connectDb from "@/lib/db"
import Booking from "@/models/booking.model"
import User from "@/models/user.model"
import { auth } from "@/auth"
import "@/models/vehicle.model"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()

    const {id} = await params

    const booking = await Booking.findById(id)
        .populate("user vehicle driver")

    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json({ message: `get booking details for partner error ${error}` }, { status: 500 })
  }
}
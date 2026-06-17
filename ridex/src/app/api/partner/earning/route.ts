import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDb()

        const session = await auth()
        const driver = await User.findOne({email: session?.user?.email})

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const bookings = await Booking.find({
            paymentStatus: "paid",
            driver: driver._id,
            createdAt: {$gte: sevenDaysAgo}
        }).select("partnerAmount createdAt")

        let earningMap: Record<string, number>={}

        bookings.forEach(b => {
            const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", 
                month: "short"
            })

            if(!earningMap[date]) {
                earningMap[date] = 0
            }

            earningMap[date] += b.partnerAmount
        })

        const earnings = Object.entries(earningMap).map(([date, earnings]) => (
            {
                date, earnings
            }
        ))

        return NextResponse.json(
            earnings, 
            {status: 200}
        )

    } catch (error) {
        return NextResponse.json(
            {error: "partner earning error"},
            {status: 500}
        )
    }
}
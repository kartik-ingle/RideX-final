import {NextRequest, NextResponse} from "next/server"
import connectDb from "@/lib/db"
import Booking from "@/models/booking.model"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const {bookingId, razorpay_payment_id, razorpay_signature, razorpay_order_id} = await req.json()

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if(generated_signature !== razorpay_signature) {
            return NextResponse.json(
                {success: false, message: "Payment verification failed."}
            )
        }

        const booking = await Booking.findById(bookingId)
        if(!booking) {
            return NextResponse.json(
                {success: false, message: "Booking not found."}, 
            )
        }

        booking.bookingStatus = "confirmed"
        booking.paymentStatus = "paid"
        booking.adminCommission = booking.fare * 0.1
        booking.partnerAmount = booking.fare - booking.adminCommission

        await booking.save()

        return NextResponse.json(
            {success: true, adminCommission: booking.adminCommission, partnerAmount: booking.partnerAmount},
            {status: 200}
        )

    } catch (error) {
        return NextResponse.json(
            {success: false, message: "verify payment error", error},
            {status: 500}
        )
    }
}
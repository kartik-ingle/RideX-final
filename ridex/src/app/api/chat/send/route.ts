import {NextRequest, NextResponse} from "next/server"
import connectDb from "@/lib/db"
import ChatMessage from "@/models/chatMessage.model"

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const {bookingId, sender, text} = await req.json()
        const msg = await ChatMessage.create({bookingId, sender, text})

        return NextResponse.json(
            msg, 
            {status: 200}
        )
    } catch (error) {
        return NextResponse.json(
            {message: "Failed to send message", error}, 
            {status: 500}
        )
    }
}
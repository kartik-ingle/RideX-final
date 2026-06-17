import {NextRequest, NextResponse} from "next/server"
import connectDb from "@/lib/db"
import ChatMessage from "@/models/chatMessage.model"
import axios from "axios"

const geminiUrl = process.env.GEMINI_API_URL!

export async function POST(req: NextRequest) {
    try {
        await connectDb()

        const {role, lastMessage} = await req.json()

        const prompt = `Your are an AI reply suggestion system for a vehicle booking chat app.
            Generate short, smart, human-like quick reply suggestions based on: 
            - ROLE (DRIVER OR USER)
            - RECENT_MESSAGE

            Rules: 
            - Return exactly 3 suggestions
            - keep replies short (3-12 words)
            - Match the conversation context and tone
            - Driver replies should sound professional and helpful
            - User replies should sound natural and realistic 
            - Avoid repetition
            - Return ONLY valid JSON

            Output format: 
            {
                "suggestions": [
                    "Reply 1", 
                    "Reply 2",
                    "Reply 3"
                ]
            }

            Input: 
            ROLE: ${role}
            RECENT_MESSAGE: ${lastMessage}
        `
        console.log("geminiUrl:", geminiUrl);
        const response = await axios.post(geminiUrl, {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        })

        const suggestions = response.data.candidates[0].content.parts[0].text

        return NextResponse.json(
            suggestions, 
            {status: 200}
        )
    } catch (error:any) {
        return NextResponse.json(
            { message: error.response?.data.error?.message || "Failed to generate AI suggestions" },
            {status: 500}
        )
    }
}
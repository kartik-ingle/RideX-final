import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()

        if(!session || !session.user?.email) {
            return Response.json({message: "unauthorized"}, {status: 400})
        }

        const user = await User.findOne({email: session.user.email})
        if(!user) {
            return Response.json({message: "user not found"}, {status: 400})
        }

        const {accountHolder, accountNumber, ifsc, upi, mobileNumber} = await req.json()

        if(!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
            return Response.json({message: "missing required fields"}, {status: 400})
        }

        const partnerBank = await PartnerBank.findOneAndUpdate(
            {owner: user._id},
            {
                accountHolder,
                accountNumber,
                ifsc,
                upi,
                status: "added"
            },
            {upsert: true, new: true}
        )

        user.mobileNumber = mobileNumber

        user.partnerOnBoardingSteps = 3

        user.partnerStatus = "pending"

        await user.save()

        return Response.json({partnerBank, mobileNumber: user.mobileNumber}, {status: 200})
    } catch (error) {
        return Response.json({message: "internal server error"}, {status: 500})
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()

        if(!session || !session.user?.email) {
            return Response.json({message: "unauthorized"}, {status: 400})
        }

        const user = await User.findOne({email: session.user.email})
        if(!user) {
            return Response.json({message: "user not found"}, {status: 400})
        }

        const partnerBank = await PartnerBank.findOne({owner: user._id})

        if(partnerBank) {
            return Response.json({partnerBank, mobileNumber: user.mobileNumber}, {status: 200})
        } else return Response.json({message: "bank details not found"}, {status: 404})
    } catch (error) {
        return Response.json({message: "internal server error"}, {status: 500})
    }
}
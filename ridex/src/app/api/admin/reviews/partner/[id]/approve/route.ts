import { auth } from "@/auth";
import connectDb from "@/lib/db";
import partnerBank from "@/models/partnerBank.model";
import partnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    context: {params: Promise<{id: string}>}
) {
    try {
        const session = await auth()
        if(!session || !session.user?.email || session.user.role !== "admin") {
            return Response.json({message: "unauthorized"}, {status: 400})
        }

        await connectDb()

        const partnerId = (await context.params).id
        const partner = await User.findById(partnerId)

        if(!partner || partner.role !== "partner") {
            return Response.json(
                {message: "partner not found"},
                {status: 400}
            )
        }

        if(partner.partnerStatus === "approved") {
            return Response.json(
                {message: "partner already approved"},
                {status: 400}
            )
        }

        const partnerdocs = await partnerDocs.findOne({owner: partner._id})
        const partnerbank = await partnerBank.findOne({owner: partner._id})

        if(!partnerdocs || !partnerbank) {
            return Response.json(
                {message: "partner did not complete on boarding steps"},
                {status: 400}
            )
        }


        partner.partnerStatus = "approved"
        partner.videoKycStatus = "pending"
        partner.partnerOnBoardingSteps = 4
        await partner.save()
        partnerdocs.status = "approved"
        await partnerdocs.save()
        partnerbank.status = "verified"
        await partnerbank.save()

        return Response.json(
            {message: "partner approved successfully"},
            {status: 200}
        )
    } catch (error) {
        return Response.json(
            {message: "internal server error"},
            {status: 500}
        )
    }
}
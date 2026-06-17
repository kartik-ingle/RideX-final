import { auth } from "@/auth";
import connectDb from "@/lib/db";
import partnerBank from "@/models/partnerBank.model";
import partnerDocs from "@/models/partnerDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    context: {params: Promise<{id: string}>}
) {
    try {
        await connectDb()
        const session = await auth()
        if(!session || !session.user?.email || session.user.role !== "admin") {
            return Response.json({message: "unauthorized"}, {status: 400})
        }

        const partnerId = (await context.params).id
        const partner = await User.findById(partnerId)

        if(!partner || partner.role !== "partner") {
            return Response.json(
                {message: "partner not found"},
                {status: 400}
            )
        }

        const vehicle = await Vehicle.findOne({owner: partner._id})
        const documents = await partnerDocs.findOne({owner: partner._id})
        const bank = await partnerBank.findOne({owner: partnerId})

        return Response.json(
            {
                partner,
                vehicle:vehicle || null,
                documents: documents || null,
                bank: bank || null
            }, 
            {status: 200}
        )

    } catch (error) {
        return Response.json(
            {message: "internal server error"},
            {status: 500}
        )
    }
}
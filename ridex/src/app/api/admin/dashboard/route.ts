import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const session = await auth()
        console.log("session email", session?.user?.email)
console.log("user", session?.user)
console.log("role", session?.user?.role)
        if(!session || !session.user?.email || session.user.role !== "admin") {
            return Response.json({message: "unauthorized"}, {status: 401})
        }

        const totalPartners = await User.countDocuments({role: "partner"})
        const totalApprovedPartners = await User.countDocuments({role: "partner", partnerStatus: "approved"})
        const totalPendingPartners = await User.countDocuments({role: "partner", partnerStatus: "pending"})
        const totalRejectedPartners = await User.countDocuments({role: "partner", partnerStatus: "rejected"})

        const pendingPartnerUsers = await User.find({
            role: "partner", 
            partnerStatus: "pending",
            partnerOnBoardingSteps: {$gte: 3}
        })

        const partnerIds = pendingPartnerUsers.map((p) => p._id)
        const partnerVehicles = await Vehicle.find({
            owner: {$in: partnerIds}
        })
        const vehicleTypeMap = new Map(
            partnerVehicles.map((v) => [v.owner.toString(), v.type])
        )

        const pendingPartnersReviews = pendingPartnerUsers.map((p) => ({
            _id: p._id,
            name: p.name,
            email: p.email,
            vehicleType: vehicleTypeMap.get(p._id.toString())
        }))

        const pendingVehicles = await Vehicle.find({
            status: "pending",
            baseFare: {$exists: true},
        }).populate("owner")

        return NextResponse.json({
            pendingVehicles: pendingVehicles,
            stats: {
                totalPartners,
                totalApprovedPartners,
                totalPendingPartners,
                totalRejectedPartners
            },
            pendingPartnersReviews
        }, {status: 200})

    } catch (error) {
        return NextResponse.json({message: "Internal server error"}, {status: 500})
    }
}
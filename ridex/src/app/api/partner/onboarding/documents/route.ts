import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import partnerDocs from "@/models/partnerDocs.model";
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

        const formData = await req.formData()
        const aadhar = formData.get("aadhar") as Blob | null
        const license = formData.get("license") as Blob | null
        const rc = formData.get("rc") as Blob | null

        if(!aadhar || !license || !rc) {
            return Response.json({message: "missing required documents"}, {status: 400})
        }

        const updatePayload:any={
            status: "pending",
        }

        if(aadhar) {
            const url = await uploadOnCloudinary(aadhar)
            if(!url) {
                return Response.json({message: "failed to upload aadhar"}, {status: 500})
            }

            updatePayload.aadharUrl = url
        }

        if(license) {
            const url = await uploadOnCloudinary(license)
            if(!url) {
                return Response.json({message: "failed to upload license"}, {status: 500})
            }
            updatePayload.licenseUrl = url
        }

        if(rc) {
            const url = await uploadOnCloudinary(rc)
            if(!url) {
                return Response.json({message: "failed to upload rc"}, {status: 500})
            }
            updatePayload.rcUrl = url
        }

        const partnerdocs = await partnerDocs.findOneAndUpdate(
            {owner: user._id}, 
            {$set: updatePayload},
            {upsert: true, new: true}
        )

        if(user.partnerOnBoardingSteps < 2) {
            user.partnerOnBoardingSteps = 2
        } else user.partnerOnBoardingSteps = 3

        user.partnerStatus = "pending"

        await user.save()

        return Response.json(
            partnerdocs, {status: 200}
        )

    } catch (error) {
        return Response.json({message: "internal server error"}, {status: 500})
    }
}

'use client'
import { getSocket } from "@/lib/socket"
import { BookingStatus, PaymentStatus } from "@/models/booking.model"
import axios from "axios"
import { Clock, IndianRupee, Loader2, MapPin, Navigation } from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { SocketAddress } from "node:net"
import React, { useEffect, useState } from 'react'

interface IBooking {
    _id: string
    user:string
    driver:string
    vehicle:string

    pickUpAddress: string,
    dropAddress: string,

    pickUpLocation: {
        type: "Point",
        coordinates: [number, number]
    }
    dropLocation: {
        type: "Point",
        coordinates: [number, number]
    } 

    fare: number

    userMobileNumber: string
    driverMobileNumber: string

    bookingStatus: BookingStatus
    paymentStatus: PaymentStatus
    paymentDeadline: Date

    adminCommission: number
    partnerAmount: number

    pickUpOtp: string
    pickUpOtpExpires: Date

    dropOtp: string
    dropOtpExpires: Date

    createdAt?: Date
    updatedAt?: Date
}

function page() {


    const [bookings, setBookings] = useState<IBooking[]>([])
    const [loading, setLoading] = useState(false)

    const router = useRouter();

    const fetchPendingRequests = async () => {
        setLoading(true)
        try {
            const {data} = await axios.get("/api/partner/bookings/pending")
            setBookings(data)
        } catch (error) {
            console.error("Error fetching pending requests:", error)
        } finally {
            setLoading(false)
        }
    }


    const handleAccept = async (id: string) => {
        try {
            const {data} = await axios.get(`/api/partner/bookings/${id}/accept`)
            router.push("/partner/bookings/")
        } catch (error) {
            console.error("Error accepting booking:", error)
        }
    }

    const handleReject = async (id: string) => {
        try {
            const {data} = await axios.get(`/api/partner/bookings/${id}/reject`)
            window.location.reload()
        } catch (error) {
            console.error("Error rejecting booking:", error)
        }
    }

    useEffect(() => {
        fetchPendingRequests()
    }, [])

    useEffect(() => {
        const socket = getSocket()
        socket.on("new-booking", (data) => {
            setBookings((prev) => [...prev, data])
        })
        return () => {
            socket.off("new-booking")
        }
    }, [])

//     useEffect(() => {
//     const socket = getSocket();

//     socket.on("connect", () => {
//         console.log("CONNECTED:", socket.id);
//     });

//     socket.onAny((event, ...args) => {
//         console.log("EVENT:", event, args);
//     });

//     socket.on("new-booking", (data) => {
//         console.log("NEW BOOKING RECEIVED:", data);
//     });

//     return () => {
//         socket.off("connect");
//         socket.offAny();
//         socket.off("new-booking");
//     };
// }, []);

    return (
        
        <div className = "min-h-screen bg-[#f4f5f7]">
            <div className = "bg-white border-b border-gray-200">
                <div className = "max-w-6xl mx-auto px-6 py-16">
                    <h1 className = "text-4xl font-semibold text-gray-900">Ride Requests</h1>
                    <p className = "mt-3 text-lg text-gray-600">Manage your pending ride requests.</p>
                </div>        
            </div>

            <div className = "max-w-6xl mx-auto px-6 py-12">
                {loading ? (
                    <div className = "flex justify-center py-20">
                        <Loader2 className = "animate-spin w-8 h-8 text-gray-700" />
                    </div>
                ) : bookings.length == 0 ? (
                    <div className = "bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
                        <p className = "text-gray-500 text-lg">No pending ride requests.</p>
                    </div>
                ): (
                    <div className = "space-y-6">
                        {bookings.map((b, i) => (
                            <motion.div
                                key = {i}
                                initial = {{opacity: 0, y: 15}}
                                animate = {{opacity: 1, y: 0}}
                                whileHover = {{y: -2}}
                                transition = {{duration: 0.25}}
                                className = "bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition"
                            >

                                <div className = "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                                    <div className = "flex-1 space-y-6">
                                        <div className = "flex gap-4">
                                            <div className = "bg-gray-100 p-3  rounded-lg flex items-center justify-center">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className = "text-xs uppercase text-gray-400 mb-1">Pickup Location</p>
                                                <p className = "text-gray-900 font-semibold">{b.pickUpAddress}</p>
                                            </div>
                                        </div>

                                        <div className = "flex gap-4">
                                            <div className = "bg-gray-100 p-3  rounded-lg flex items-center justify-center">
                                                <Navigation size={18} />
                                            </div>
                                            <div>
                                                <p className = "text-xs uppercase text-gray-400 mb-1">Drop Location</p>
                                                <p className = "text-gray-900 font-semibold">{b.dropAddress}</p>
                                            </div>
                                        </div>

                                        <div className = "flex items-center gap-2 text-sm text-gray-500 mt-2">
                                            <Clock size = {14} className = "font-medium" />
                                            <span>
                                                {new Date(b.createdAt!).toLocaleString("en-IN", {
                                                    day: "2-digit", 
                                                    month: "short", 
                                                    year: "numeric", 
                                                    hour: "2-digit", 
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className = "flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto">
                                        <div className = "text-left lg:text-right">
                                            <p className = "text-xs tracking-wide text-gray-400 uppercase mb-1">Estimated Fare</p>
                                            <div className = "flex items-center gap-2 text-3xl font-bold text-gray-900 lg:justify-end">
                                                <IndianRupee size = {20} />
                                                {b.fare}
                                            </div>
                                        </div>

                                        <div className = "flex gap-4 w-full lg:w-auto">
                                            <button className = "bg-white flex-1 lg:flex-none hover:bg-gray-100 text-gray-700 text-sm py-3 px-6 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 font-semibold border border-gray-300 cursor-pointer"
                                                onClick = {() => handleReject(b._id)}
                                            >
                                                Reject
                                            </button>
                                            <button className = "flex-1 lg:flex-none px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center cursor-pointer"
                                                onClick = {() => handleAccept(b._id)}
                                            >
                                                Accept Ride
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </div>
                )
                }
            </div>
        </div>
    )
}

export default page

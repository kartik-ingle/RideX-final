'use client'

import { useEffect } from "react"
import { getSocket } from "@/lib/socket"
import { useSelector } from "react-redux"

export default function SocketIdentity() {

    const user = useSelector((state:any) => state.user.userData)


    useEffect(() => {
        if (!user?._id) return

        const socket = getSocket()

        const identify = () => {
            socket.emit("identity", user._id)
        }

        socket.on("connect", identify)

        if (socket.connected) {
            identify()
        }

        return () => {
            socket.off("connect", identify)
        }
    }, [user?._id])

    return null
}
"use client"

import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
export function SessionSync() {
  const { data: session, status } = useSession()
  const lastUserId = useRef<string | undefined>(session?.user?.id)

  useEffect(() => {
    // Channel for cross-tab communication
    const authChannel = new BroadcastChannel("auth_sync")

    const handleSync = (event: MessageEvent) => {
      if (event.data.type === "SESSION_CHANGE") {
        // Force reload when another tab logs in/out
        window.location.reload()
      }
    }

    authChannel.addEventListener("message", handleSync)

    // Detect changes in the current tab session
    if (status === "authenticated" && session?.user?.id) {
      if (lastUserId.current && lastUserId.current !== session.user.id) {
        authChannel.postMessage({ type: "SESSION_CHANGE", userId: session.user.id })
        window.location.reload()
      }
      lastUserId.current = session.user.id
    } else if (status === "unauthenticated" && lastUserId.current) {
      authChannel.postMessage({ type: "SESSION_CHANGE", userId: null })
      window.location.reload()
    }

    return () => {
      authChannel.removeEventListener("message", handleSync)
      authChannel.close()
    }
  }, [session, status])

  return null
}

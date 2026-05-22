"use client";

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"

function decodeToken(token: string) {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      router.push('/auth')
      return
    }

    const payload = decodeToken(token)
    setAuth({
      access_token: token,
      user: {
        id: payload.sub,
        email: payload.email,
        rol: payload.rol,
        nombre: payload.nombre,
        apellido: payload.apellido,
      },
    })
    router.push('/')
  }, [])

  return <p>Iniciando sesión...</p>
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p>Iniciando sesión...</p>}>
      <CallbackContent />
    </Suspense>
  )
}

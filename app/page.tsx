'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks'

export default function Home() {
  const router = useRouter()
  const { usuario, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (usuario) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [usuario, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner"></div>
    </div>
  )
}

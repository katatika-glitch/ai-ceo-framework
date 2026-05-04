'use client'

import { useState } from 'react'

export default function UpgradeButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={className}
    >
      {loading ? '処理中…' : '有料プランへアップグレード'}
    </button>
  )
}

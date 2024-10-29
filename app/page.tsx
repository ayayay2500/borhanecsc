'use client'

import { useEffect, useState } from 'react'
import { WebApp } from '@twa-dev/types'

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()

      const initData = tg.initData || ''
      const initDataUnsafe = tg.initDataUnsafe || {}

      if (initDataUnsafe.user) {
        fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initDataUnsafe.user),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error)
            } else {
              setUser(data)
            }
          })
          .catch((err) => {
            setError('فشل حفض معلومات المستخدم')
          })
      } else {
        setError('مكانش معلومات مستخدم متاحة')
      }
    } else {
      setError('من فضلك افت البوت على تلجرام')
    }
  }, [])

  const handleIncreasePoints = async () => {
    if (!user) return

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId }),
      })
      const data = await res.json()
      if (data.success) {
        setUser({ ...user, points: data.points })
        setNotification('بصحتك ')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError('فشل اضافة رصيد')
      }
    } catch (err) {
      setError('مشكل في حفض الرصيد الخاص بك')
    }
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!user) return <div className="container mx-auto p-4">...لاتقلق</div>

  return (
    <div className="container mx-auto p-4 bg-dark-background text-white rounded-lg shadow-3xl">
      <div className="flex items-center mb-4">
        <img
          src="/icon2.png" // الصورة من ملف icon1.png
          alt={`${user.firstName}'s profile`}
          className="w-12 h-12 rounded-full mr-4 shadow-lg border-2 border-gray-300"
        />
        <h1 className="text-3xl font-bold">{user.firstName}!</h1>
      </div>
      <p>Balance: <span className="text-blue-300 font-semibold">{user.points}</span></p>
      <button
        onClick={handleIncreasePoints}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 mt-6"
      >
        Tap Tap Tap 
      </button>
      {notification && (
        <div className="mt-6 p-3 bg-green-600 text-white rounded-md shadow-md">
          {notification}
        </div>
      )}
    </div>
  )
}

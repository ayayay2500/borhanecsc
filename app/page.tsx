'use client'

import { useEffect, useState } from 'react'
import { FaWallet, FaYoutube } from 'react-icons/fa' // استيراد الرموز من react-icons
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
  const [taskStatus, setTaskStatus] = useState({ task1: false, task2: false, task3: false })

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
          .catch(() => {
            setError('Failed to fetch user data')
          })
      } else {
        setError('No user data available')
      }
    } else {
      setError('This app should be opened in Telegram')
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
        setNotification('Points increased successfully!')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError('Failed to increase points')
      }
    } catch {
      setError('An error occurred while increasing points')
    }
  }

  const handleClaimTask = (task: string) => {
    if (!taskStatus[task]) {
      setTaskStatus({ ...taskStatus, [task]: true })
      handleIncreasePoints()
    }
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!user) return <div className="container mx-auto p-4">Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <img
          src={user.photoUrl || '/default-profile.png'}
          alt="User profile"
          className="rounded-full w-12 h-12 mr-4"
        />
        <h1 className="text-2xl font-bold">{user.firstName}</h1>
      </div>
      <div className="flex items-center mb-4">
        <FaWallet className="mr-2 text-gray-700" />
        <p className="text-lg">Balance: {user.points}</p>
      </div>
      
      <div className="flex flex-col items-center space-y-4 mt-8">
        {['task1', 'task2', 'task3'].map((task, index) => (
          <div key={task} className="flex items-center bg-gray-200 p-4 rounded-lg w-80 justify-between">
            <FaYoutube className="text-red-600 text-3xl" />
            <p className="text-lg font-semibold">Task {index + 1}</p>
            <button
              onClick={() => handleClaimTask(task)}
              disabled={taskStatus[task]}
              className={`${
                taskStatus[task] ? 'bg-green-500' : 'bg-blue-500'
              } text-white font-bold py-2 px-4 rounded`}
            >
              {taskStatus[task] ? 'Claimed' : '100 Points'}
            </button>
          </div>
        ))}
      </div>

      {notification && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          {notification}
        </div>
      )}
    </div>
  )
}

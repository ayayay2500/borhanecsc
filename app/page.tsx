'use client'

import { useEffect, useState } from 'react'
import { WebApp } from '@twa-dev/types'
import 'bootstrap/dist/css/bootstrap.min.css'
import { FaWallet, FaYoutube } from 'react-icons/fa'

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
  const [completedTasks, setCompletedTasks] = useState<string[]>([])

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
            setError('Failed to fetch user data')
          })
      } else {
        setError('No user data available')
      }
    } else {
      setError('This app should be opened in Telegram')
    }
  }, [])

  const handleIncreasePoints = async (points) => {
    if (!user) return

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId, points }),
      })
      const data = await res.json()
      if (data.success) {
        setUser({ ...user, points: data.points })
        setNotification('Points increased successfully!')
        setTimeout(() => setNotification(''), 3000)
      } else {
        setError('Failed to increase points')
      }
    } catch (err) {
      setError('An error occurred while increasing points')
    }
  }

  const tasks = [
    { id: 'task1', title: 'Watch YouTube Video 1', points: 100, url: 'https://youtube.com' },
    { id: 'task2', title: 'Watch YouTube Video 2', points: 200, url: 'https://youtube.com' },
    { id: 'task3', title: 'Watch YouTube Video 3', points: 300, url: 'https://youtube.com' },
  ]

  const handleTaskClaim = (taskId, points) => {
    if (!completedTasks.includes(taskId)) {
      handleIncreasePoints(points)
      setCompletedTasks([...completedTasks, taskId])
    }
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!user) return <div className="container mx-auto p-4">Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <div className="d-flex align-items-center mb-4">
        <img src={user.photoUrl} alt="User" className="rounded-circle me-2" width="50" height="50" />
        <h1 className="text-2xl font-bold">{user.firstName}</h1>
      </div>

      <div className="mb-4">
        <FaWallet className="me-2" />
        <span className="font-bold">Balance:</span> {user.points}
      </div>

      <div className="my-5">
        {tasks.map((task) => (
          <div key={task.id} className="card mb-3">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaYoutube className="me-2 text-danger" />
                <span>{task.title}</span>
              </div>
              {completedTasks.includes(task.id) ? (
                <button className="btn btn-success" disabled>Claimed</button>
              ) : (
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  {task.points} Points
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {notification && (
        <div className="alert alert-success mt-4">
          {notification}
        </div>
      )}
    </div>
  )
}

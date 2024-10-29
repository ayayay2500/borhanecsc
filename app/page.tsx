'use client'

import { useEffect, useState } from 'react'
import { WebApp } from '@twa-dev/types'
import './styles.css';

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

interface Task {
  id: number;
  title: string;
  image: string;
  points: number;
  link: string;
  claimed: boolean; // لحفظ حالة استلام النقاط
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'ملخص مبارة الجزائر وكوتديفوار', image: '/icon1.png', points: 100, link: 'https://www.youtube.com/', claimed: false },
    { id: 2, title: 'TikTok', image: '/icon2.png', points: 100, link: 'https://www.tiktok.com/', claimed: false },
    { id: 3, title: 'Telegram Channel', image: '/icon3.png', points: 100, link: 'https://t.me/yourchannel', claimed: false },
  ]);

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

      // استرجاع حالة المهام من التخزين المحلي
      const storedTasks = localStorage.getItem('claimedTasks');
      if (storedTasks) {
        const claimedTasks = JSON.parse(storedTasks);
        setTasks(prevTasks =>
          prevTasks.map(task => ({
            ...task,
            claimed: claimedTasks.includes(task.id),
          }))
        );
      }
    } else {
      setError('This app should be opened in Telegram')
    }
  }, [])

  const handleClaimPoints = async (taskId: number) => {
    if (!user) return;

    // تحديث حالة المهمة
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, claimed: true } : task
    );

    setTasks(updatedTasks);

    // حفظ حالة المهام في التخزين المحلي
    const claimedTasks = updatedTasks.filter(task => task.claimed).map(task => task.id);
    localStorage.setItem('claimedTasks', JSON.stringify(claimedTasks));

    // إرسال النقاط إلى الخادم
    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId, points: updatedTasks.find(task => task.id === taskId)?.points }),
      });

      const data = await res.json();
      if (data.success) {
        setUser({ ...user, points: data.points });
        setNotification('Points claimed successfully!');
        setTimeout(() => setNotification(''), 3000);
      } else {
        setError('Failed to claim points');
      }
    } catch (err) {
      setError('An error occurred while claiming points');
    }
  }

  const handleGoToTask = (taskId: number) => {
    // عند الذهاب إلى المهمة، تحديث حالة المهمة بحيث يكون الزر في حالة "Claim"
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, claimed: false } : task
      )
    );
  }

  if (error) {
    return <div className="container error">{error}</div>
  }

  if (!user) return <div className="container loading">Loading...</div>

  return (
    <div className="container">
      <div className="user-info">
        <img src="/icon.png" alt="User Icon" className="user-icon" />
        <h1>{user.firstName}</h1>
      </div>
      <p>Your current points: {user.points}</p>

      <div className="tasks-container">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <img src={task.image} alt={task.title} className="task-image" />
            <h2 className="task-title">{task.title}</h2>
            <a href={task.link} target="_blank" rel="noopener noreferrer" className="task-button" onClick={() => handleGoToTask(task.id)}>
              Go to Task
            </a>
            {task.claimed ? (
              <button className="done-button" disabled>
                Done ✅
              </button>
            ) : (
              <button
                onClick={() => handleClaimPoints(task.id)}
                className="claim-button"
              >
                Claim {task.points} Points
              </button>
            )}
          </div>
        ))}
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  )
}

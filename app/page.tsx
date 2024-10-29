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

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState('')
  const [isTaskDone, setIsTaskDone] = useState<boolean>(false) // الحالة لإظهار إذا تمت المهمة
  const [isClaimed, setIsClaimed] = useState<boolean>(false) // الحالة لإظهار إذا تم استلام النقاط

  useEffect(() => {
    const storedTaskStatus = localStorage.getItem('isTaskDone');
    if (storedTaskStatus) {
      setIsTaskDone(JSON.parse(storedTaskStatus));
    }

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initDataUnsafe = tg.initDataUnsafe || {};

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
              setError(data.error);
            } else {
              setUser(data);
            }
          })
          .catch((err) => {
            setError('Failed to fetch user data');
          });
      } else {
        setError('No user data available');
      }
    } else {
      setError('This app should be opened in Telegram');
    }
  }, []);

  const handleClaimPoints = async () => {
    if (!user || isClaimed) return;

    try {
      const res = await fetch('/api/increase-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramId: user.telegramId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, points: data.points });
        setNotification('You have claimed 100 points!');
        setIsClaimed(true); // تفعيل حالة استلام النقاط
        setIsTaskDone(true); // تفعيل حالة تنفيذ المهمة
        localStorage.setItem('isTaskDone', 'true'); // حفظ الحالة في localStorage
        setTimeout(() => setNotification(''), 3000);
      } else {
        setError('Failed to increase points');
      }
    } catch (err) {
      setError('An error occurred while increasing points');
    }
  }

  const handleTaskCompletion = () => {
    // توجيه المستخدم إلى يوتيوب
    window.open('https://youtube.com', '_blank');
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

      <div className="task-container">
        <img src="/icon1.png" alt="Task Icon" className="task-icon" />
        <h2>Complete the task to earn points!</h2>
        <p>Earn 100 points by completing this task.</p>
        {!isTaskDone ? (
          <button onClick={handleTaskCompletion} className="task-button">
            Complete Task
          </button>
        ) : (
          <button onClick={handleClaimPoints} className={`task-button ${isClaimed ? 'done' : ''}`}>
            {isClaimed ? 'Done' : 'Claim Points'}
          </button>
        )}
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
}

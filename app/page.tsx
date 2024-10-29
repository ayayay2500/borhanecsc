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
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [pointsReceived, setPointsReceived] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [usedCodes, setUsedCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()

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
          .catch(() => setError('Failed to fetch user data'));
      } else {
        setError('No user data available');
      }
    } else {
      setError('This app should be opened in Telegram');
    }
  }, []);

  const handleCodeSubmission = () => {
    if (usedCodes.has(inputCode)) {
      setNotification('Cannot repeat the code!');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    let pointsToAdd = 0;
    switch (inputCode) {
      case 'borhane':
        pointsToAdd = 160;
        break;
      case 'bobo':
        pointsToAdd = 50;
        break;
      case 'messaoudi':
        pointsToAdd = 70;
        break;
      default:
        setNotification('Invalid code!');
        setTimeout(() => setNotification(''), 3000);
        return;
    }

    setPointsReceived(pointsToAdd);
    setUsedCodes(new Set(usedCodes.add(inputCode)));
    setNotification(`You've received ${pointsToAdd} points!`);
    setTimeout(() => setNotification(''), 3000);
    setInputCode('');
  }

  const toggleDialog = () => {
    setDialogOpen(!dialogOpen);
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  if (!user) return <div className="container loading">Loading...</div>;

  return (
    <div className="container">
      <div className="user-info">
        <img src="/icon.png" alt="User Icon" className="user-icon" />
        <h1>{user.firstName}</h1>
      </div>
      <p>Your current points: {user.points + pointsReceived}</p>

      <div className="icon-container" onClick={toggleDialog}>
        <img src="/icon1.png" alt="Code Icon" className="code-icon" />
        <span>Code</span>
      </div>

      {dialogOpen && (
        <div className="dialog">
          <h2>Enter Code</h2>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter your code"
          />
          <button onClick={handleCodeSubmission}>Submit</button>
          <button onClick={toggleDialog}>Close</button>
        </div>
      )}

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <div className="grid-container">
        <div className="grid-item">
          <img src="/icon2.png" alt="Icon 2" />
          <h3>Link 1</h3>
          <button onClick={() => window.open('https://link1.com', '_blank')}>Go to Link</button>
        </div>
        <div className="grid-item">
          <img src="/icon2.png" alt="Icon 2" />
          <h3>Link 2</h3>
          <button onClick={() => window.open('https://link2.com', '_blank')}>Go to Link</button>
        </div>
        <div className="grid-item">
          <img src="/icon2.png" alt="Icon 2" />
          <h3>Link 3</h3>
          <button onClick={() => window.open('https://link3.com', '_blank')}>Go to Link</button>
        </div>
      </div>
    </div>
  );
}

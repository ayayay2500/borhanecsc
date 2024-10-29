import { useEffect, useState } from 'react';
import { WebApp } from '@twa-dev/types';
import './styles.css';

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const storedCountdown = localStorage.getItem('countdown');
    const storedDisabled = localStorage.getItem('isDisabled');

    if (storedCountdown) {
      setCountdown(Number(storedCountdown));
    }

    if (storedDisabled) {
      setIsDisabled(JSON.parse(storedDisabled));
    }

    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsDisabled(false);
            localStorage.removeItem('countdown');
            localStorage.removeItem('isDisabled');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      const initData = tg.initData || '';
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

  const handleIncreasePoints = async () => {
    if (!user || isDisabled) return;

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
        setNotification('Points increased successfully!');
        setCountdown(60); // ضبط العد التنازلي إلى 60 ثانية
        setIsDisabled(true); // تعطيل الزر
        localStorage.setItem('countdown', '60');
        localStorage.setItem('isDisabled', 'true');
        setTimeout(() => setNotification(''), 3000);
      } else {
        setError('لم تستلم رصيد');
      }
    } catch (err) {
      setError('مشكل بسبب الظغط ');
    }
  };

  const handleImageClick = () => {
    handleIncreasePoints();
    // إضافة تأثير الاهتزاز
    const image = document.getElementById('increase-points-image');
    if (image) {
      image.classList.add('shake');
      setTimeout(() => {
        image.classList.remove('shake');
      }, 500); // مدة الاهتزاز
    }
  };

  if (error) {
    return <div className="container error">{error}</div>;
  }

  if (!user) return <div className="container loading">...لاتقلق</div>;

  return (
    <div className="container">
      <div className="user-info">
        <img src="/icon.png" alt="User Icon" className="user-icon" />
        <h1>{user.firstName}</h1>
      </div>
      <p>Balance: {user.points}</p>
      <img
        id="increase-points-image"
        src="/icon2.png" // استخدام الصورة الجديدة
        alt="Increase Points"
        className={`increase-points-image ${isDisabled ? 'disabled' : ''}`}
        onClick={handleImageClick}
        style={{ cursor: 'pointer' }} // يجعل المؤشر يظهر كـ pointer عند مرور الماوس فوق الصورة
      />
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </div>
  );
}

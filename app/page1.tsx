'use client'
import { useEffect, useState } from 'react'

export default function DailyReward() {
  const [adsCount, setAdsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const MAX_ADS = 7

  const handleWatchAd = async () => {
    // @ts-ignore
    if (window.Adsgram) {
       setIsLoading(true)
       // @ts-ignore
       const AdController = window.Adsgram.init({ blockId: "int-20305" });
       const result = await AdController.show();
       if (result.done) {
          // هنا تضع كود الـ fetch لزيادة النقاط
          alert("تمت مشاهدة الإعلان بنجاح!")
       }
       setIsLoading(false)
    }
  }

  return (
    <div className="reward-container">
      <h2 style={{textAlign: 'center', marginBottom: '20px'}}>🎁 هدايا يومية</h2>
      <div className="reward-card" style={{background: '#2c3e50', padding: '20px', borderRadius: '15px', textAlign: 'center'}}>
        <p>التقدم: {adsCount} / {MAX_ADS}</p>
        <button 
          onClick={handleWatchAd}
          disabled={isLoading}
          style={{background: '#f1c40f', color: '#000', padding: '12px 20px', border: 'none', borderRadius: '10px', marginTop: '15px', fontWeight: 'bold'}}
        >
          {isLoading ? 'جاري التحميل...' : '📺 شاهد إعلان'}
        </button>
      </div>
    </div>
  )
}

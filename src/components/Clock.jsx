import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

const Clock = () => {
    const [time, setTime] = useState(new Date());
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
            // 시간이 바뀔 때마다 애니메이션 효과 추가
            setAnimate(true);
            setTimeout(() => setAnimate(false), 500);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const day = dayNames[date.getDay()];
        return `${y}.${m}.${d} (${day})`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="live-clock">
            <div className="clock-date">
                <ClockIcon size={14} className="clock-icon" />
                {formatDate(time)}
            </div>
            <div className={`clock-time ${animate ? 'clock-pulse' : ''}`}>
                {formatTime(time)}
            </div>
            <style jsx>{`
                .live-clock {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    padding: 0.5rem 1rem;
                    border-radius: var(--border-radius-lg);
                    background-color: var(--bg-secondary);
                    transition: all var(--transition-normal) var(--easing-standard);
                }
                
                .live-clock:hover {
                    box-shadow: var(--shadow-md);
                    transform: translateY(-2px);
                }
                
                .clock-date {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: var(--font-size-xs);
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                
                .clock-icon {
                    color: var(--primary-color);
                }
                
                .clock-time {
                    font-size: var(--font-size-lg);
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    color: var(--text-primary);
                    transition: all 0.2s ease;
                }
                
                .clock-pulse {
                    color: var(--primary-color);
                    transform: scale(1.05);
                }
                
                @media (max-width: 640px) {
                    .live-clock {
                        padding: 0.25rem 0.5rem;
                    }
                    
                    .clock-time {
                        font-size: var(--font-size-base);
                    }
                }
            `}</style>
        </div>
    );
};

export default Clock;
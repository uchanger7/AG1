import React, { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const day = dayNames[date.getDay()];
        return `${y}.${m}.${d}(${day})`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="live-clock">
            <div className="clock-date">{formatDate(time)}</div>
            <div className="clock-time">{formatTime(time)}</div>
        </div>
    );
};

export default Clock;

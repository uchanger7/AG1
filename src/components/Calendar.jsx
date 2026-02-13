import React from 'react';
import './Calendar.css';

const Calendar = ({ selectedDate, onDateClick, projects }) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Dummy days for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`prev-${i}`} className="calendar-day empty"></div>);
    }

    // Days of current month
    const HOLIDAYS_2026 = [
        '2026-01-01', // 신정
        '2026-02-16', '2026-02-17', '2026-02-18', // 설날
        '2026-03-01', '2026-03-02', // 삼일절 (대체공휴일 포함)
        '2026-05-05', // 어린이날
        '2026-05-24', '2026-05-25', // 부처님 오신 날 (대체공휴일 포함)
        '2026-06-06', // 현충일
        '2026-08-15', // 광복절
        '2026-09-24', '2026-09-25', '2026-09-26', // 추석
        '2026-10-03', // 개천절
        '2026-10-09', // 한글날
        '2026-12-25'  // 성탄절
    ];

    const formatDateStr = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // 오늘 날짜 확인을 위한 변수
    const today = new Date();
    const todayStr = formatDateStr(today);

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dayOfWeek = date.getDay(); // 0: Sun, 6: Sat
        const dateStr = formatDateStr(date);
        const isHoliday = HOLIDAYS_2026.includes(dateStr);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isSelected = formatDateStr(selectedDate) === dateStr;
        const isToday = dateStr === todayStr; // 오늘 날짜 체크

        const isNonWorkingDay = isHoliday || isWeekend;
        const dayProjects = projects.filter(p => {
            // Check project-specific holiday setting
            if (isNonWorkingDay && !p.includeHolidays) {
                return false;
            }
            const startStr = p.startDate;
            const endStr = p.endDate;
            const dueStr = p.dueDate;
            return (dateStr >= startStr && dateStr <= endStr) || dateStr === dueStr;
        });

        // 클래스에 오늘 날짜 표시 추가
        const dayClass = `calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${dayOfWeek === 0 || isHoliday ? 'holiday' : ''} ${dayOfWeek === 6 ? 'saturday' : ''}`;

        days.push(
            <div
                key={d}
                className={dayClass}
                onClick={() => onDateClick(date)}
            >
                <span className="day-number">{d}</span>
                <div className="day-events">
                    {dayProjects.slice(0, 3).map((p, idx) => (
                        <div
                            key={idx}
                            className="calendar-event"
                            style={{
                                backgroundColor: p.color + '33',
                                borderLeft: `3px solid ${p.color}`,
                                color: p.color
                            }}
                            title={`${p.client} - ${p.productName}`}
                        >
                            {p.client}
                        </div>
                    ))}
                    {dayProjects.length > 3 && <div className="event-more">+{dayProjects.length - 3}</div>}
                </div>
            </div>
        );
    }

    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={() => onDateClick(new Date(year, month - 1, 1))}>&lt;</button>
                <h3>{year}년 {monthNames[month]}</h3>
                <button onClick={() => onDateClick(new Date(year, month + 1, 1))}>&gt;</button>
            </div>
            <div className="calendar-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                    <div key={d} className="calendar-weekday">{d}</div>
                ))}
                {days}
            </div>
        </div>
    );
};

export default Calendar;
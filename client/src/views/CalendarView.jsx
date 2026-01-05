// views/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from '../api/axios';
import { motion } from 'framer-motion';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/bookings/therapist');
            const bookings = res.data;

            // Transform bookings to calendar events
            const calendarEvents = bookings.map(booking => {
                const startDate = new Date(`${booking.date}T${booking.time}`);
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour session

                return {
                    id: booking._id,
                    title: `${booking.user?.name || 'Patient'} - ${booking.status}`,
                    start: startDate,
                    end: endDate,
                    resource: {
                        status: booking.status,
                        patientName: booking.user?.name,
                        bookingId: booking._id,
                    },
                };
            });

            setEvents(calendarEvents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setLoading(false);
        }
    };

    // Color-code events by status
    const eventStyleGetter = (event) => {
        let backgroundColor = '#6366f1'; // Default indigo

        switch (event.resource.status) {
            case 'pending':
                backgroundColor = '#f59e0b'; // Orange
                break;
            case 'confirmed':
                backgroundColor = '#10b981'; // Green
                break;
            case 'completed':
                backgroundColor = '#3b82f6'; // Blue
                break;
            case 'rejected':
            case 'cancelled':
                backgroundColor = '#ef4444'; // Red
                break;
            default:
                backgroundColor = '#6366f1';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontWeight: 'bold',
                fontSize: '12px',
                padding: '4px 8px',
            },
        };
    };

    const handleSelectEvent = (event) => {
        alert(`Appointment with ${event.resource.patientName}\nStatus: ${event.resource.status}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                        📅 Appointment Calendar
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Manage your schedule at a glance
                    </p>
                </div>

                {/* Legend */}
                <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Completed</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 calendar-container">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    popup
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-center">
                    <div className="text-2xl font-black text-orange-600 dark:text-orange-400">
                        {events.filter(e => e.resource.status === 'pending').length}
                    </div>
                    <div className="text-xs font-bold text-orange-700 dark:text-orange-500 uppercase tracking-wider mt-1">
                        Pending
                    </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
                    <div className="text-2xl font-black text-green-600 dark:text-green-400">
                        {events.filter(e => e.resource.status === 'confirmed').length}
                    </div>
                    <div className="text-xs font-bold text-green-700 dark:text-green-500 uppercase tracking-wider mt-1">
                        Confirmed
                    </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {events.filter(e => e.resource.status === 'completed').length}
                    </div>
                    <div className="text-xs font-bold text-blue-700 dark:text-blue-500 uppercase tracking-wider mt-1">
                        Completed
                    </div>
                </div>
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-center">
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {events.length}
                    </div>
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-wider mt-1">
                        Total
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CalendarView;

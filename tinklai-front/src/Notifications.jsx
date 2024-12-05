import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const Notifications = ({ role }) => {
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState('');
    const [userid, setUserid] = useState('');

    const getUsers = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching user data:', error));
    };

    const getNotifications = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/notifications`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => setNotifications(response.data))
            .catch(error => console.error('Error fetching notifications:', error));
    };

    const markAsRead = (id) => {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/read`, { id }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(() => {
                alert('Notification marked as read');
                getNotifications();
            })
            .catch(error => {
                console.error('Error marking notification as read:', error);
                alert('Failed to mark notification as read. Please try again.');
            });
    };

    const sendNotification = (message, userId) => {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/notifications`, { message, userId }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(() => {
                alert('Notification sent successfully');
            })
            .catch(error => {
                console.error('Error sending notification:', error);
                alert('Failed to send notification. Please try again.');
            });
    }

    useEffect(() => {
        if (role !== 'admin' && role !== 'manager') {
            getNotifications();
        } else {
            getUsers();
        }
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Pranešimai</h1>
            {(role === 'admin' || role === 'manager') ? (
                <div>
                    <h2 className="text-lg font-semibold">Siųsti pranešimą</h2>
                    <form onSubmit={(e) => { e.preventDefault(); sendNotification(message, userid) }}>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border rounded p-2 w-full"
                        />
                        <select
                            value={userid}
                            onChange={(e) => setUserid(e.target.value)}
                            className="border rounded p-2 w-full"
                        >
                            <option value="">Pasirinkti naudotoją</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                        <button className="bg-indigo-600 text-white py-2 px-4 rounded" type="submit">Siųsti</button>
                    </form>
                </div>
            ) : (
                <div>
                    <h2 className="text-lg font-semibold">Pranešimai</h2>
                    {notifications.map(notification => (
                        <div key={notification.id} className="border rounded p-2 my-2">
                            <p>{notification.message}</p>
                            <p className="text-sm text-gray-500">Sukurtas: {new Date(notification.created_at).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Perskaityta: {notification.is_read ? 'Yes' : 'No'}</p>
                            <button
                                onClick={() => markAsRead(notification.id)}
                                className="bg-indigo-600 text-white py-1 px-2 rounded"
                            > Pažymėti kaip perskaityta</button>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
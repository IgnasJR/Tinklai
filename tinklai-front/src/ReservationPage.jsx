import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const ReservationPage = ({ token, role }) => {
    const [reservations, setReservations] = useState([]);

    const fetchReservations = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/reservations`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setReservations(response.data);
        })
        .catch(error => {
            console.error('There was an error fetching the reservations!', error);
        });
    };

    useEffect(() => {
        fetchReservations();
    }, [token]);

    function confirmReservation(id, sum) {
        if (role === 'admin' || role === 'manager') {
            if (window.confirm(`Are you sure you want to confirm reservation: ${id}?`)) {
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reservation/confirm`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ id })
                })
                fetchReservations();
            }
        }
        else {
            if (window.confirm(`Are you sure you want to pay: ${sum}?`)) {
                fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reservation/pay`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ id, sum })
                })
                fetchReservations();
            }
        }
        
    }

    function cancelReservation(id) {
        if (window.confirm(`Are you sure you want to cancel reservation: ${id}?`)) {
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reservation/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ id })
            })
            fetchReservations();
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Rezervacijos</h1>
            <table className="min-w-full bg-white border border-gray-200 text-center">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Pradžios data</th>
                        <th className="py-2 px-4 border-b">Pabaigos data</th>
                        <th className="py-2 px-4 border-b">Naudotojas</th>
                        <th className="py-2 px-4 border-b">Kambarys</th>
                        <th className="py-2 px-4 border-b">Statusas</th>
                        <th className="py-2 px-4 border-b">Liko mokėti</th>
                        <th className="py-2 px-4 border-b">Sumokėta</th>
                        <th className="py-2 px-4 border-b">Veiksmai</th>
                        {role === 'admin' || role === "manager" ? (
                            <><th className="py-2 px-4 border-b">Naudotojo išleista suma</th><th className="py-2 px-4 border-b">Bendras užsakymų skaičius</th></>) : null}

                    </tr>
                </thead>
                <tbody>
                {reservations.map(reservation => (
                <tr key={reservation.reservation_id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{new Date(reservation.start_date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{new Date(reservation.end_date).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{reservation.user_name}</td>
                    <td 
                        className="py-2 px-4 border-b cursor-pointer text-blue-500 hover:underline"
                        onClick={() => window.location.href = `/room/${reservation.room_id}`}
                    >
                        {reservation.room_title}
                    </td>
                    <td className="py-2 px-4 border-b">{reservation.status}</td>
                    <td className="py-2 px-4 border-b">{reservation.left_to_pay}</td>
                    <td className="py-2 px-4 border-b">{reservation.price - reservation.left_to_pay}</td>
                    <td className="py-2 px-4 border-b">
                        {((role === 'admin' || role === 'manager') && (reservation.total_reservations >= 1 || reservation.price-reservation.left_to_pay >= reservation.price*0.1) && reservation.status == "awaiting") && (
                            <button 
                                className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 mr-2"
                                onClick={() => confirmReservation(reservation.reservation_id)}
                            >
                                Patvirtinti
                            </button>
                        )}
                        {(role === 'user' && reservation.left_to_pay > 0) && (
                            <button 
                                className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700 mr-2"
                                onClick={() => {reservation.price - reservation.left_to_pay == 0 ? confirmReservation(reservation.reservation_id, reservation.price*0.1) : confirmReservation(reservation.reservation_id, reservation.left_to_pay)}}
                            >
                                {reservation.price - reservation.left_to_pay == 0 ? 'Sumokėti rezervacijos sumą' : 'Sumokėti likusią sumą'}
                            </button>
                        )}
                        <button 
                            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700"
                            onClick={() => cancelReservation(reservation.reservation_id)}
                        >
                            Atšaukti
                        </button>
                    </td>
                    {role === 'admin' || role === "manager" ? (
                        <>
                            <td className="py-2 px-4 border-b">
                                {reservation.total_spent}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {reservation.total_reservations}
                            </td>
                        </>
                        ) : null}
                </tr>
            ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReservationPage;
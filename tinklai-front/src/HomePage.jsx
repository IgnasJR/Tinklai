import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage({ token }) {
    const [rooms, setRooms] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(
        new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
    );
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRoomCount, setMinRoomCount] = useState('');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/rooms`, {
            params: {
                start_date: startDate,
                end_date: endDate,
                city: city || undefined,
                min_price: minPrice || undefined,
                max_price: maxPrice || undefined,
                min_room_count: minRoomCount || undefined,
            },
        })
            .then(response => setRooms(response.data))
            .catch(error => console.error('Error fetching room data:', error));
    };

    function reserveRoom(roomId) {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/reserve`, {
            roomId,
            startDate,
            endDate,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(() => alert('Kambarys sėkmingai rezervuotas!'))
        .catch(error => console.error('Error reserving room:', error));
    }

    return (
        <div className="container mx-auto mt-10 px-4">
            <h1 className="text-3xl font-bold text-center mb-6">Galimi kambariai</h1>
            <div className="flex flex-col sm:flex-row justify-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                    <label className="block text-lg text-gray-700">Miestas</label>
                    <select
                        className="border rounded p-2 w-full"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="">Pasirinkite miestą</option>
                        <option value="Vilnius">Vilnius</option>
                        <option value="Kaunas">Kaunas</option>
                        <option value="Klaipeda">Klaipeda</option>
                        <option value="Siauliai">Siauliai</option>
                        <option value="Panevezys">Panevezys</option>
                    </select>
                </div>
                <div>
                    <label className="block text-lg text-gray-700">Minimali kaina</label>
                    <input
                        type="number"
                        className="border rounded p-2 w-full"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="minimali kaina"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-lg text-gray-700">Maksimali kaina</label>
                    <input
                        type="number"
                        className="border rounded p-2 w-full"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="maksimali kaina"
                    />
                </div>
                <div>
                    <label className="block text-lg text-gray-700">Minimalus lovų skaičius</label>
                    <input
                        type="number"
                        className="border rounded p-2 w-full"
                        value={minRoomCount}
                        onChange={(e) => setMinRoomCount(e.target.value)}
                        placeholder="lovų skaičius"
                    />
                </div>
            </div>
            <div className="flex justify-center mb-6 space-x-4">
                <div>
                    <label className="block text-lg text-gray-700">Atvykimas</label>
                    <input
                        type="date"
                        className="border rounded p-2 w-full"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        max={endDate}
                        onChange={(e) => {
                            const newStartDate = e.target.value;
                            setStartDate(newStartDate);
                            if (newStartDate > endDate) {
                                setEndDate(newStartDate);
                            }
                        }}
                    />
                </div>
                <div>
                    <label className="block text-lg text-gray-700">Išvykimas</label>
                    <input
                        type="date"
                        className="border rounded p-2 w-full"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
            <div className="text-center mb-6">
                <button
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
                    onClick={fetchRooms}
                >
                    Atnaujinti
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {rooms.filter(room => room.remaining_rooms > 0).map((room) => (
                    <div key={room.room_id} className="card bg-white shadow-lg rounded-lg overflow-hidden">
                        <img
                            src={room.photo_link || 'https://via.placeholder.com/400x250?text=Room+Image'}
                            className="w-full h-56 object-cover"
                            alt={`Room ${room.title}`}
                        />
                        <div className="p-4">
                            <h5 className="text-xl font-semibold">{room.title}</h5>
                            <p className="text-gray-600 mt-2">
                                <strong>Miestas:</strong> {room.hotel_city} <br />
                                <strong>Viešbutis:</strong> {room.hotel_name} <br />
                                <strong>Lovos:</strong> {room.bed_count} <br />
                                <strong>Kaina nakčiai:</strong> ${room.price.toFixed(2)} <br />
                                <strong>Like kambariai:</strong> {room.remaining_rooms}
                            </p>
                            {token ? (
                                <button
                                    className="mt-4 px-6 py-2 bg-blue-500 w-full text-white rounded-full hover:bg-blue-600 transition duration-300"
                                    onClick={() => reserveRoom(room.room_id)}
                                >
                                    Rezervuoti
                                </button>
                            ) : (
                                <p className="mt-4 text-red-500">Log in to reserve a room.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;

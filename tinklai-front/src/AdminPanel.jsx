import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const AdminPanel = ({ token, role }) => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [bedCount, setBedCount] = useState('');
    const [image, setImage] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchHotels();
        getUsers();
    }, []);

    const fetchHotels = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/hotels`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => setHotels(response.data))
            .catch(error => console.error('Error fetching hotel data:', error));
    };

    const handleMakeAdmin = (id) => {
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/make-admin`, { id }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(() => {
                setMessage('Naudotojo rolė pakeista sėkmingai!');
            })
            .catch(error => {
                console.error('Error updating user role:', error);
                setMessage('Nepavyko pakeisti naudotojo rolės.');
            }
            );
    };

    const getUsers = () => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(response => setUsers(response.data))
            .catch(error => console.error('Error fetching user data:', error));
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        const newRoom = {
            hotel_id: selectedHotel,
            room_number: roomNumber,
            price,
            description,
            bed_count: bedCount,
            image
        };

        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/rooms`, newRoom, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => {
                setMessage('Kambarys pridėtas sėkmingai!');
                setSelectedHotel('');
                setRoomNumber('');
                setPrice('');
                setDescription('');
                setBedCount('');
                setImage('');
            })
            .catch(error => {
                console.error('Error adding room:', error);
                setMessage('Nepavyko pridėti kambario.');
            });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Pridėti darbuotoją</h1>
            <div>
                <div className="flex justify-between items-center border-b border-gray-300 py-2 text-center font-bold">
                    <p className="w-1/4">Vardas</p>
                    <p className="w-1/4">El. paštas</p>
                    <p className="w-1/4">Rolė</p>
                    <p className="w-1/4">Veiksmas</p>
                </div>
                {
                    users.map(user => (
                        <div key={user.id} className="flex justify-between items-center border-b border-gray-300 py-2 text-center">
                            <p className="w-1/4">{user.name}</p>
                            <p className="w-1/4">{user.email}</p>
                            <p className="w-1/4">{user.role}</p>
                            <button
                                onClick={() => handleMakeAdmin(user.id)}
                                className="w-1/4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                            >
                                Keisti rolę
                            </button>
                        </div>
                    ))
                }
            </div>

            {message && (
                <div className={`mb-4 ${message.includes('sėkmingai') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">Pridėti kambarį</h1>
            {message && (
                <div className={`mb-4 ${message.includes('sėkmingai') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pasirinkti viešbutį</label>
                    <select
                        value={selectedHotel}
                        onChange={(e) => setSelectedHotel(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Pasirinkti kambarį</option>
                        {hotels.map(hotel => (
                            <option key={hotel.hotel_id} value={hotel.hotel_id}>
                                {hotel.hotel_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kambarių skaičius</label>
                    <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kaina</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pavadinimas</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    ></input>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Lovų skaičius</label>
                    <input
                        value={bedCount}
                        onChange={(e) => setBedCount(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        type='number'
                    ></input>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nuotraukos nuoroda</label>
                    <input
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        type='text'
                    ></input>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                >
                    Pridėti kambarį
                </button>
            </form>
        </div>
    );
};

export default AdminPanel;

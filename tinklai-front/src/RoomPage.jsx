import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const RoomPage = () => {
    const { id } = useParams();
    const [roomData, setRoomData] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/room/${id}`)
            .then(response => response.json())
            .then(data => {
                setRoomData(data);
            })
            .catch(error => {
                console.error('There was an error fetching the rooms!', error);
            });
    }, [id]);

    if (!roomData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-4">{roomData.title}</h1>
            <p className="text-lg mb-2"><span className="font-semibold">Hotel:</span> {roomData.hotel_name}</p>
            <p className="text-lg mb-2"><span className="font-semibold">City:</span> {roomData.hotel_city}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Bed Count:</span> {roomData.bed_count}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Price:</span> ${roomData.price}</p>
            <p className="text-lg mb-4"><span className="font-semibold">Remaining Rooms:</span> {roomData.remaining_rooms}</p>
            <img className="w-full h-auto rounded-lg" src={roomData.photo_link} alt={roomData.title} />
        </div>
    );
}

export default RoomPage;
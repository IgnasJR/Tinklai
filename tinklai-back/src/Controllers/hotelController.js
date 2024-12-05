const express = require('express');
const db = require('../db');
const { verifyToken } = require('./userController');


const router = express.Router();

router.get('/rooms', (req, res) => {
    const { start_date, end_date, city, min_price, max_price, min_room_count } = req.query;
    
    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Please provide start_date and end_date' });
    }

    let query = `
        SELECT 
            Room.id AS room_id,
            Room.hotel_id,
            Room.bed_count,
            Room.price,
            Room.title,
            Room.room_count - IFNULL(COUNT(Reservation.id), 0) AS remaining_rooms,
            Room.image_link AS photo_link,
            Hotel.title AS hotel_name,
            Hotel.city AS hotel_city
        FROM 
            Room
        LEFT JOIN
            Hotel ON Room.hotel_id = Hotel.id
        LEFT JOIN 
            Reservation ON Room.id = Reservation.room_id
            AND Reservation.status != 'canceled'
            AND (
                (Reservation.start_date BETWEEN ? AND ?) OR 
                (Reservation.end_date BETWEEN ? AND ?) OR
                (? BETWEEN Reservation.start_date AND Reservation.end_date) OR
                (? BETWEEN Reservation.start_date AND Reservation.end_date)
            )
        WHERE 1=1
    `;

    const queryParams = [start_date, end_date, start_date, end_date, start_date, end_date];

    if (city) {
        query += ' AND Hotel.city = ?';
        queryParams.push(city);
    }

    if (min_price) {
        query += ' AND Room.price >= ?';
        queryParams.push(min_price);
    }

    if (max_price) {
        query += ' AND Room.price <= ?';
        queryParams.push(max_price);
    }

    if (min_room_count) {
        query += ' AND Room.bed_count >= ?';
        queryParams.push(min_room_count);
    }

    query += ' GROUP BY Room.id, Hotel.id;';

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.get('/hotels', (req, res) => {
    const query = `
        SELECT 
            Hotel.id AS hotel_id,
            Hotel.title AS hotel_name
        FROM Hotel
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.post('/rooms', (req, res) => {
    const { hotel_id, room_number, price, description, bed_count, image} = req.body;
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!hotel_id || !room_number || !price || !description) {
        return res.status(400).json({ error: 'Please provide hotel_id, room_number, price, and description' });
    }

    const query = 'INSERT INTO Room (hotel_id, room_count, price, title, bed_count, image_link) VALUES (?, ?, ?, ?, ?, ?)';

    db.query(query, [hotel_id, room_number, price, description, bed_count, image], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Room added successfully' });
    });
});

router.post('/reservation/pay', (req, res) => {
    const { id, sum } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (!id || !sum) {
        return res.status(400).json({ error: 'Please provide id and sum' });
    }

    const query = 'INSERT INTO Payment (reservation_id, amount, user_id) VALUES (?, ?, ?)';

    db.query(query, [id, sum, user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Payment added successfully' });
    });
});

router.get('/room/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Please provide id' });
    }

    const query = `
        SELECT 
            Room.id AS room_id,
            Room.hotel_id,
            Room.bed_count,
            Room.price,
            Room.title,
            Room.room_count - IFNULL(COUNT(Reservation.id), 0) AS remaining_rooms,
            Room.image_link AS photo_link,
            Hotel.title AS hotel_name,
            Hotel.city AS hotel_city
        FROM 
            Room
        LEFT JOIN
            Hotel ON Room.hotel_id = Hotel.id
        LEFT JOIN 
            Reservation ON Room.id = Reservation.room_id
            AND Reservation.status != 'canceled'
        WHERE Room.id = ?
        GROUP BY Room.id, Hotel.id;
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
    });
});


module.exports = router;

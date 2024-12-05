const express = require('express');
const db = require('../db');
const { verifyToken } = require('./userController');

const router = express.Router();

router.post('/reserve', (req, res) => {
    const { roomId, startDate, endDate } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token yra privalomas' });
    }

    if (!roomId) {
        return res.status(400).json({ error: 'Kambario id yra privalomas' });
    }

    if (startDate === undefined || endDate === undefined || startDate > endDate) {
        return res.status(400).json({ error: 'Neteisingi datos reziai' });
    }

    user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Netinkamas token' });
    }

    const checkReservationsQuery = `
        SELECT COUNT(*) AS confirmed_reservations 
        FROM Reservation 
        WHERE user_id = ? AND status = "confirmed"
    `;
    
    db.query(checkReservationsQuery, [user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const confirmedReservations = results[0].confirmed_reservations;
        const status = confirmedReservations >= 10 ? 'confirmed' : 'awaiting';

        const insertQuery = `
            INSERT INTO Reservation (user_id, room_id, start_date, end_date, status) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [user.id, roomId, startDate, endDate, status], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Rezervuota sekmingai', status });
        });
    });
});

router.get('/reservations', (req, res) => { 
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token yra privalomas' });
    }
    user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Neteisingas Token' });
    }

    console.log(user);

    let queryParams = [];
    if (user.role === 'admin' || user.role === 'manager') {
        query = `
        SELECT 
        Reservation.id AS reservation_id,
        Reservation.user_id,
        Reservation.room_id,
        Reservation.start_date,
        Reservation.end_date,
        User.name AS user_name,
        Room.title AS room_title,
        Reservation.status as status,
        DATEDIFF(Reservation.end_date, Reservation.start_date) * Room.price AS price,
        (DATEDIFF(Reservation.end_date, Reservation.start_date) * Room.price - IFNULL(SUM(Payment.amount), 0)) AS left_to_pay,
        (SELECT COUNT(*) FROM Reservation WHERE Reservation.user_id = User.id AND Reservation.status = "confirmed") AS total_reservations,
        (SELECT IFNULL(SUM(Payment.amount), 0) FROM Payment WHERE Payment.user_id = User.id) AS total_spent,
        (SELECT Payment.user_id FROM Payment WHERE Payment.reservation_id = Reservation.id LIMIT 1) AS payment_user_id
        FROM 
        Reservation
        JOIN 
        User ON Reservation.user_id = User.id
        JOIN 
        Room ON Reservation.room_id = Room.id
        LEFT JOIN 
        Payment ON Reservation.id = Payment.reservation_id
        GROUP BY 
        Reservation.id;
        `;
    } else {
        query = `
            SELECT 
                Reservation.id AS reservation_id,
                Reservation.user_id,
                Reservation.room_id,
                Reservation.start_date,
                Reservation.end_date,
                User.name AS user_name,
                Room.title AS room_title,
                Reservation.status as status,
                DATEDIFF(Reservation.end_date, Reservation.start_date) * Room.price AS price,
                (DATEDIFF(Reservation.end_date, Reservation.start_date) * Room.price - IFNULL(SUM(Payment.amount), 0)) AS left_to_pay,
                (SELECT COUNT(*) FROM Reservation WHERE Reservation.user_id = ? AND Reservation.status = "confirmed") AS total_reservations
            FROM 
                Reservation
            JOIN 
                User ON Reservation.user_id = User.id
            JOIN 
                Room ON Reservation.room_id = Room.id
            LEFT JOIN 
                Payment ON Reservation.id = Payment.reservation_id
            WHERE 
                Reservation.user_id = ?
            GROUP BY 
                Reservation.id;
        `;
        queryParams.push(user.id, user.id);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});

router.post('/reservation/confirm', (req, res) => {
    if (!req.body.id) {
        return res.status(400).json({ error: 'Rezervacijos ID yra privalomas' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token yra privalomas' });
    }
    user = verifyToken(token);
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return res.status(401).json({ error: 'Neautorizuota' });
    }
    const query = 'UPDATE Reservation SET status = "confirmed" WHERE id = ?';
    db.query(query, [req.body.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Rezervacija patvirtinta sėkmingai' });
    });
});

router.post('/reservation/cancel', (req, res) => {
    if (!req.body.id) {
        return res.status(400).json({ error: 'Rezervacijos ID yra būtinas' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    user = verifyToken(token);
    if (!user){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'admin' && user.role !== 'manager') {
        const query = 'UPDATE Reservation SET status = "canceled" WHERE id = ? AND user_id = ?';
        db.query(query, [req.body.id, user.id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Reservation cancelled successfully' });
        });
    }
    else {
        const query = 'UPDATE Reservation SET status = "canceled" WHERE id = ?';
        db.query(query, [req.body.id], (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Reservation cancelled successfully' });
        });
    }
});

    
module.exports = router;

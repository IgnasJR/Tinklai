const express = require('express');
const db = require('../db');
const { verifyToken } = require('./userController');


const router = express.Router();

router.get('/notifications', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    const query = `
        SELECT 
            notifications.id,
            notifications.message,
            notifications.created_at,
            notifications.is_read
        FROM 
            notifications
        WHERE user_id = ?
    `;
    db.query(query, [user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.post('/notifications', (req, res) => {
    const { message, userId } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    
    const user = verifyToken(token);
    console.log(user);
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    db.query('INSERT INTO notifications (message, user_id) VALUES (?, ?)', [message, userId], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Notification sent successfully' });
    });
});

router.post('/notifications/read', (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, user.id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Notification not found or not authorized' });
        }
        res.status(200).json({ message: 'Notification marked as read' });
    });
});



module.exports = router;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const db = require('../db');

const router = express.Router();


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Visi laukai yra privalomi' });
    }

    const checkUserQuery = 'SELECT * FROM User WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Naudotojas egzistuoja' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)';
            db.query(query, [name, email, hashedPassword, "user"], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: 'Pavyko' });
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'El. paštas ir slaptažodis yra privalomi' });
    }

    const query = 'SELECT * FROM User WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Netinkami prisijungimo duomenys' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Netinkami prisijungimo duomenys' });
        }

        const token = generateToken(user);

        res.json({ token, role: user.role });
    });
});

const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
};

router.get('/users', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }
    user = verifyToken(token);
    if (!user || user.role !== 'admin') {
        return res.status(401).json({ error: 'Neleistina' });
    }

    const query = 'SELECT id, name, email, role FROM User';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.post('/user/make-admin', (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token yra privalomas' });
    }
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
        return res.status(401).json({ error: 'Neleistina' });
    }
    db.query('UPDATE User SET role = CASE WHEN role = "manager" THEN "user" ELSE "manager" END WHERE id = ? AND role != "admin"', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(400).json({ error: 'Nepakeista' });
        }
        res.status(200).json({ message: 'Pavyko' });
    });   
});

module.exports = router;
module.exports.generateToken = generateToken;
module.exports.verifyToken = verifyToken;
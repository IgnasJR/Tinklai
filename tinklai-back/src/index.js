const express = require('express');
const cors = require('cors');
const hotelController = require('./Controllers/hotelController');
const userController = require('./Controllers/userController');
const reservationController = require('./Controllers/reservationController');
const notificationController = require('./Controllers/notificationController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', hotelController);
app.use('/api', userController);
app.use('/api', reservationController);
app.use('/api', notificationController);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

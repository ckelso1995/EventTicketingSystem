const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./routes/routes'); 

const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

//parse json and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve the website pages
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://thegfreak:1IV8830CyI5oQq9l@eventtickingsystem.wopwxff.mongodb.net/?retryWrites=true&w=majority&appName=EventTickingSystem';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

//route file
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


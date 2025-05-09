const express = require('express');
const path = require('path');
const { registerUser, loginUser } = require('../Controllers/userController'); 
const { createEvent, editEvent, deleteEvent, getEvents } = require('../Controllers/eventController'); 
const Event = require('../Models/Event'); 
const Booking = require('../Models/Booking'); 

const router = express.Router();

// home route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html')); 
});

// user routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// GET the events page
router.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'events.html'));
});

// GET the admin page
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'admin.html'));
});

// event routes
router.get('/api/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:id', editEvent);
router.delete('/events/:id', deleteEvent);

// get event details by id
router.get('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching the event.' });
    }
});

// code to make the booking
router.post('/bookings', async (req, res) => {
    try {
        const { user, event, quantity } = req.body;

        if (!user || !event || !quantity) {
            return res.status(400).json({ message: 'User, event, and quantity are required.' });
        }

      

        const eventDetails = await Event.findById(event);
        if (!eventDetails) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const availableSeats = eventDetails.seatCapacity - eventDetails.bookedSeats;
        if (quantity > availableSeats) {
            return res.status(400).json({ message: `Not enough available seats. Only ${availableSeats} seats are available.` });
        }

        const booking = new Booking({ user, event, quantity });
        await booking.save();

        eventDetails.bookedSeats += quantity;
        await eventDetails.save();

        res.status(201).json({ message: 'Booking confirmed.', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the booking.' });
    }
});

// GET bookings by event id
router.get('/api/bookings/event/:eventId', async (req, res) => {
    try {
        const bookings = await Booking.find({ event: req.params.eventId }).populate('user').populate('event');
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching bookings by event.' });
    }
});

// GET bookings by user id
router.get('/api/bookings/user/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId }).populate('user').populate('event');
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching bookings by user.' });
    }
});

// GET bookings by event title
router.get('/api/bookings/event', async (req, res) => {
    try {
        const { title } = req.query;

        if (!title) {
            return res.status(400).json({ message: 'Event title is required.' });
        }

        const bookings = await Booking.find()
            .populate({
                path: 'event',
                match: { title: { $regex: title, $options: 'i' } },
            })
            .populate('user');

        const filteredBookings = bookings.filter(booking => booking.event !== null);

        res.status(200).json(filteredBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching bookings by event title.' });
    }
});

// GET bookings by user email
router.get('/api/bookings/user', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'User email is required.' });
        }

        const bookings = await Booking.find()
            .populate({
                path: 'user',
                match: { email: { $regex: email, $options: 'i' } },
            })
            .populate('event');

        const filteredBookings = bookings.filter(booking => booking.user !== null);

        res.status(200).json(filteredBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching bookings by user email.' });
    }
});

module.exports = router;



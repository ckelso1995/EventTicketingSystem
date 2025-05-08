const Event = require('../Models/Event');

//create a new event
const createEvent = async (req, res) => {
    try {
        const { title, description, category, venue, date, time, seatCapacity, price } = req.body;

        // validation for required fields, if perameters are not met, error
        if (!title || !date || !seatCapacity || !price) {
            return res.status(400).json({ message: 'Title, date, seat capacity, and price are required.' });
        }

       
        const newEvent = new Event({
            title,
            description,
            category,
            venue,
            date,
            time,
            seatCapacity,
            price,
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully.', event: newEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the event.' });
    }
};




// get events with optional filters
const getEvents = async (req, res) => {
    try {
        const { category, date, location } = req.query;

   
        const query = {};
        if (category) query.category = category;
        if (date) query.date = new Date(date);
        if (location) query.venue = { $regex: location, $options: 'i' }; // should not be case sensitive but right now is

        const events = await Event.find(query);
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching events.' });
    }
};



// edit an existing event
const editEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

       
        const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.status(200).json({ message: 'Event updated successfully.', event: updatedEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the event.' });
    }
};

// delete an event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

       
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        // code for capacity enforement logic
        if (event.bookedSeats > 0) {
            return res.status(400).json({ message: 'Cannot delete, tickets are booked for this event.' });
        }

        // delete by id
        await Event.findByIdAndDelete(id);
        res.status(200).json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the event.' });
    }
};



module.exports = { createEvent, editEvent, deleteEvent, getEvents };

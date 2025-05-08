
//delete an event on the admin page
async function deleteEvent(eventId) {
    const confirmDelete = confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;

    const response = await fetch(`/events/${eventId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert('Event deleted successfully!');
        fetchEvents(); // delete and refresh
    } else {
        const error = await response.json();
        alert(`Error: ${error.message}`); // catch any errors
    }
}
//get and display events
async function fetchEvents() {
    const response = await fetch('/api/events');
    const events = await response.json();

    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = ''; 

    if (events.length === 0) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = `
            <h2>${event.title}</h2>
            <p>${event.description || 'No event description available.'}</p>
            <p><strong>Category:</strong> ${event.category || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
            <p><strong>Location:</strong> ${event.venue || 'N/A'}</p>
            <button onclick="window.location.href='/edit-event.html?id=${event._id}'" class="form-button edit-button">Edit</button>
            <button onclick="deleteEvent('${event._id}')" class="form-button delete-button">Delete</button>
        `;
        eventsList.appendChild(eventDiv);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Event added successfully!');
            fetchEvents(); 
            e.target.reset(); 
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    });

    fetchEvents();
});

document.addEventListener('DOMContentLoaded', () => {
    // get and display bookings
    async function fetchBookings(filters = {}) {
        let url = '/api/bookings';
        if (filters.email) {
            url = `/api/bookings/user?email=${encodeURIComponent(filters.email)}`;
        } else if (filters.title) {
            url = `/api/bookings/event?title=${encodeURIComponent(filters.title)}`;
        }

        const response = await fetch(url);
        const bookings = await response.json();

        const bookingsList = document.getElementById('bookings-list');
        bookingsList.innerHTML = ''; 

        if (bookings.length === 0) {
            bookingsList.innerHTML = '<p>No bookings found.</p>';
            return;
        }

        bookings.forEach(booking => {
            const bookingDiv = document.createElement('div');
            bookingDiv.className = 'booking';
            bookingDiv.innerHTML = `
                <p><strong>User:</strong> ${booking.user?.email || 'N/A'}</p>
                <p><strong>Event:</strong> ${booking.event?.title || 'N/A'}</p>
                <p><strong>Quantity:</strong> ${booking.quantity}</p>
                <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            `;
            bookingsList.appendChild(bookingDiv);
        });
    }

    // filter bookings dynamically without reloading the page
    document.getElementById('filter-bookings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const filters = Object.fromEntries(formData.entries());
        await fetchBookings(filters); 
    });
});

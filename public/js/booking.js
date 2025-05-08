document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
        alert('Error: Event ID is missing.');
        window.location.href = '/events.html'; 
        return;
    }

    // get event details
    const response = await fetch(`/api/events/${eventId}`);
    const event = await response.json();

    // should display event details - 
    const eventDetails = document.getElementById('event-details');
    eventDetails.innerHTML = `
        <h2>${event.title}</h2>
        <p>${event.description || 'No description available.'}</p>
        <p><strong>Category:</strong> ${event.category || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.time || 'N/A'}</p>
        <p><strong>Location:</strong> ${event.venue || 'N/A'}</p>
        <p><strong>Available Seats:</strong> ${event.seatCapacity - event.bookedSeats}</p>
    `;

    // booking form
    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());
        data.event = eventId; 

        // using local storage, retrieve user data from local storage
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Error: User is not logged in.');
            window.location.href = '/'; // Redirect to login page
            return;
        }
        data.user = userId; // adds the user id  to the booking data

        const response = await fetch('/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Booking confirmed!');
            window.location.href = '/events.html'; 
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`); //catch errors
        }
    });
});


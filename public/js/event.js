
        //helper function to convert military time to standard time
    function convertToStandardTime(militaryTime) {
            if (!militaryTime) return 'N/A';
    const [hours, minutes] = militaryTime.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        }

    // should show events from the database
async function fetchEvents(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/events?${query}`);
    const events = await response.json();

    const eventsList = document.getElementById('events-list');
    eventsList.innerHTML = '';

    if (events.length === 0) {
        eventsList.innerHTML = '<p>No events found.</p>';
        return;
    }
            //code to grab and view event details and calculate available seats
    events.forEach(event => {
        const availableSeats = event.seatCapacity - event.bookedSeats;
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        eventDiv.innerHTML = `
            <h2>${event.title}</h2>
            <p>${event.description || 'No description available.'}</p>
            <p><strong>Category:</strong> ${event.category || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${convertToStandardTime(event.time)}</p>
            <p><strong>Location:</strong> ${event.venue || 'N/A'}</p>
            <p><strong>Available Seats:</strong> ${availableSeats}</p>
            <button onclick="window.location.href='/booking.html?eventId=${event._id}'" class="form-button book-button">Book Now</button>
        `;
        eventsList.appendChild(eventDiv);
    });
}
        // form submission and filter dynamically
        document.getElementById('filter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
    const formData = new FormData(e.target);
    const filters = Object.fromEntries(formData.entries());
    await fetchEvents(filters);
        });


    fetchEvents();

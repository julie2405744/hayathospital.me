
function filterDoctors() {
    var sector   = document.getElementById('sector-filter').value;
    var filtered = (sector === 'all')
        ? doctors
        : doctors.filter(function(d) { return d.sector === sector; });
    renderDoctorList(filtered);
}

function renderDoctorList(list) {
    var container = document.getElementById('doctor-list');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-msg">No doctors found for this specialty.</p>';
        return;
    }

    for (var i = 0; i < list.length; i++) {
        var doctor         = list[i];
        var doctorBookings = bookings.filter(function(b) { return b.doctorName === doctor.name; });
        var isFull         = doctorBookings.length >= doctor.maxCapacity;

        var card = document.createElement('div');
        card.className = 'doctor-card card';
        card.innerHTML =
            '<div class="doctor-info">'
            + '<div class="doctor-name">'     + escHtml(doctor.name)     + '</div>'
            + '<div class="doctor-meta">'     + escHtml(doctor.sector)   + ' · ' + escHtml(doctor.timeSlot) + '</div>'
            + '<div class="doctor-capacity">' + doctorBookings.length    + ' / ' + doctor.maxCapacity + ' booked</div>'
            + '</div>'
            + '<button class="btn-book' + (isFull ? ' btn-full' : '') + '" '
            + (isFull ? 'disabled' : 'onclick="openBookingModal(\'' + escHtml(doctor.name) + '\')"') + '>'
            + (isFull ? 'Fully Booked' : 'Book')
            + '</button>';

        container.appendChild(card);
    }
}

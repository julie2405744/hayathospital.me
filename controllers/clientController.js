const Doctor  = require('../models/Doctor');
const Booking = require('../models/Booking');
const User    = require('../models/User');

function parseTimeMins(timeStr) {
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let h  = parseInt(match[1], 10);
    const m  = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return { h, m };
}

function getAppointmentTime(timeSlot, avgTime, position) {
    try {
        const parts    = timeSlot.split(' - ');
        const startStr = parts[0].includes(', ')
            ? parts[0].substring(parts[0].lastIndexOf(', ') + 2)
            : parts[0];

        const parsed = parseTimeMins(startStr);
        if (!parsed) return new Date();

        const now = new Date();
        now.setHours(parsed.h, parsed.m + position * avgTime, 0, 0);
        return now;
    } catch (e) {
        return new Date();
    }
}

exports.getDashboard = async (req, res) => {
    try {
        const doctors  = await Doctor.find().sort({ name: 1 });
        const bookings = await Booking.find().sort({ createdAt: 1 });
        const user     = await User.findById(req.session.user.id);

        const myBookings = bookings
            .filter(b => b.patientId && b.patientId.toString() === req.session.user.id)
            .map(b => {
                const doctorBookings = bookings.filter(db => db.doctorName === b.doctorName);
                const pos = doctorBookings.findIndex(db => db._id.toString() === b._id.toString()) + 1;
                return {
                    id:              b._id.toString(),
                    doctorName:      b.doctorName,
                    patientName:     b.patientName,
                    appointmentType: b.appointmentType,
                    appointmentTime: b.appointmentTime,
                    positionInLine:  pos
                };
            });

        res.render('pages/client-dashboard', { doctors, bookings, myBookings, user });
    } catch (err) {
        console.error('client getDashboard:', err);
        res.render('pages/client-dashboard', { doctors: [], bookings: [], myBookings: [], user: null });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId   = req.session.user.id;
        const user     = await User.findById(userId);
        const bookings = await Booking.find({ patientId: userId }).sort({ createdAt: 1 });

        const allBookings = await Booking.find().sort({ createdAt: 1 });
        const enrichedBookings = bookings.map(b => {
            const doctorBookings = allBookings.filter(db => db.doctorName === b.doctorName);
            const pos = doctorBookings.findIndex(db => db._id.toString() === b._id.toString()) + 1;
            return { ...b.toObject(), positionInLine: pos };
        });

        res.render('pages/profile', {
            user,
            appointments:  enrichedBookings,
            phoneSuccess:  req.query.phone === 'saved'
        });
    } catch (err) {
        console.error('client getProfile:', err);
        res.status(500).render('pages/error', { statusCode: 500, errorDetail: err.message });
    }
};

exports.updatePhone = async (req, res) => {
    try {
        const { phone } = req.body;
        const cleaned   = (phone || '').replace(/\s+/g, '').trim();

        // ── Backend Validation ──
        if (!cleaned)
            return res.redirect('/client/profile?error=Phone+number+is+required.');
        if (!/^\+?[0-9]{7,15}$/.test(cleaned))
            return res.redirect('/client/profile?error=Invalid+phone+format.+Use+7-15+digits,+optionally+starting+with+%2B.');

        await User.findByIdAndUpdate(req.session.user.id, { phone: cleaned });
        res.redirect('/client/profile?phone=saved');
    } catch (err) {
        res.redirect('/client/profile?error=' + encodeURIComponent(err.message));
    }
};
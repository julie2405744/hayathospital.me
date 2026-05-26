const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    doctorName:      { type: String, required: true },
    patientName:     { type: String, required: true },
    patientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appointmentType: { type: String, required: true, enum: ['Consultation', 'Follow-up', 'Lab Result'] },
    appointmentTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);

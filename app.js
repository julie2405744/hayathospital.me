
const express  = require('express');
const path     = require('path');
const dotenv   = require('dotenv');
const session  = require('express-session');
const mongoose = require('mongoose');

dotenv.config();

const app = express();


mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hayat')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:  process.env.SESSION_SECRET || 'hayat-dev-secret',
    resave:  false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));


app.use((req, res, next) => {
    res.locals.sessionUser = req.session.user    || null;
    res.locals.isAdmin     = req.session.isAdmin || false;
    next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/', require('./routes/landing'));
app.use('/auth', require('./routes/auth'));
app.use('/client',require('./routes/client'));
app.use('/admin',require('./routes/admin'));
app.use('/doctor', require('./routes/doctor'));

app.use((req, res) => {
    res.status(404).render('pages/error', { statusCode: 404, errorDetail: null });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).render('pages/error', {
        statusCode,
        errorDetail: process.env.NODE_ENV === 'production' ? null : err.message
    });
});


const http = require('http');
const https = require('https');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`🚀 HTTP Server running at http://localhost:${PORT}`);
});


try {
    const privateKey = fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🔒 HTTPS Server running at https://localhost:${HTTPS_PORT}`);
    });
} catch (err) {
    console.log('⚠️ Could not start HTTPS server: ', err.message);
}

module.exports = app;


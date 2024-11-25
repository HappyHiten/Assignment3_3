require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const app = express();

// Import routes
const authRoutes = require('./routes/auth'); // Authentication routes
const dietPlanRoutes = require('./routes/dietplans'); // Diet Plan management routes

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection error:', err));

// Middleware
app.use(express.static('public')); // Serve static files
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(methodOverride('_method')); // Enable PUT/DELETE methods via _method
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Use session secret from environment
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Passport configuration
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); // User model
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Global Variables for Flash Messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; // Set current user in global variables
    next();
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Routes
app.use('/auth', authRoutes); // Routes for authentication (login, register, logout)
app.use('/dietPlans', dietPlanRoutes); // Routes for managing diet plans

// Home Route
app.get('/', (req, res) => {
    res.send('Hello, Diet Plan App is running!'); // Default homepage
});

// Test Database Connection Route
app.get('/test-db', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.send('Database connection is active');
    } catch (err) {
        res.status(500).send('Database connection error');
    }
});

// Handle 404 Errors (Page Not Found)
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

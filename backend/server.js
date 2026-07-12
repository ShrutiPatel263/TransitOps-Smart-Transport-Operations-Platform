const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const maintenanceRoutes = require('./routes/maintenance');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('TransitOps API is running...');
});

// Database Connection & Auto Seed
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

mongoose
    .connect(MONGODB_URI)
    .then(async () => {
        console.log('MongoDB connection successful');

        // Auto seed a default Fleet Manager if no users exist
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('No users found in database. Seeding default accounts...');

            // Let's seed one of each role for easy testing!
            await User.create([
                {
                    name: 'System Fleet Manager',
                    email: 'manager@transitops.com',
                    password: 'password123', // Will be hashed by pre-save middleware
                    role: 'Fleet Manager'
                },
                {
                    name: 'Regular Driver User',
                    email: 'driver@transitops.com',
                    password: 'password123',
                    role: 'Driver'
                },
                {
                    name: 'Safety Officer User',
                    email: 'safety@transitops.com',
                    password: 'password123',
                    role: 'Safety Officer'
                },
                {
                    name: 'Financial Analyst User',
                    email: 'finance@transitops.com',
                    password: 'password123',
                    role: 'Financial Analyst'
                }
            ]);
            console.log('Successfully seeded default users:');
            console.log(' - manager@transitops.com (password123)');
            console.log(' - driver@transitops.com (password123)');
            console.log(' - safety@transitops.com (password123)');
            console.log(' - finance@transitops.com (password123)');
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB database connection error: ', err);
    });

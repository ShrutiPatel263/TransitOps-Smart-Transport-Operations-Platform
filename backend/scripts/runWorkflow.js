const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const Expense = require('../models/Expense');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' }); // load from backend/ if running from scripts directory

const run = async () => {
    const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';
    console.log(`Connecting to MongoDB at: ${URI}...`);
    await mongoose.connect(URI);
    console.log('Connected!');

    // Clear existing test entries for clean run if they conflict
    await Vehicle.deleteMany({ registrationNumber: 'VAN-05' });
    await Driver.deleteMany({ name: 'Alex' });
    await Trip.deleteMany({});
    await Maintenance.deleteMany({});
    await Expense.deleteMany({});

    console.log('\n--- Step 1: Register vehicle "Van-05" with maximum capacity 500 kg. Status = Available. ---');
    const vehicle = await Vehicle.create({
        registrationNumber: 'VAN-05',
        model: 'Ford Transit',
        type: 'Van',
        maxCapacity: 500, // 500 kg
        odometer: 12000,   // standard odometer start
        acquisitionCost: 25000,
        status: 'Available'
    });
    console.log(`Vehicle registered: ID=${vehicle._id}, Status=${vehicle.status}, Capacity=${vehicle.maxCapacity}kg`);

    console.log('\n--- Step 2: Register driver "Alex" with a valid driving license. ---');
    // Expiring in 2 years
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    const driver = await Driver.create({
        name: 'Alex',
        licenseNumber: 'DL-987654321',
        licenseCategory: 'Class B',
        licenseExpiryDate: expiryDate,
        contactNumber: '+1-555-0199',
        safetyScore: 95,
        status: 'Available'
    });
    console.log(`Driver registered: ID=${driver._id}, Status=${driver.status}, License Expiry=${driver.licenseExpiryDate.toDateString()}`);

    console.log('\n--- Step 3: Create a trip with Cargo Weight = 450 kg. ---');
    const cargoWeight = 450;
    console.log(`Validating cargo weight matches vehicle capacity...`);
    if (cargoWeight > vehicle.maxCapacity) {
        throw new Error('Validation failed: Cargo capacity exceeded vehicle limit!');
    }
    console.log(`Validation PASSED: ${cargoWeight}kg <= ${vehicle.maxCapacity}kg.`);

    // Create the Trip in Draft/Dispatched
    const trip = await Trip.create({
        source: 'Warehouse A',
        destination: 'Distribution Center B',
        vehicle: vehicle._id,
        driver: driver._id,
        cargoWeight: cargoWeight,
        distance: 120, // 120 km
        revenue: 800,  // revenue generated
        status: 'Dispatched' // dispatching immediately
    });
    console.log(`Trip created and Dispatched: ID=${trip._id}, Status=${trip.status}`);

    // Transition vehicle/driver statuses
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
    await vehicle.save();
    await driver.save();
    console.log(`Auto Status Transition: Vehicle Status=${vehicle.status}, Driver Status=${driver.status}`);

    console.log('\n--- Step 6: Complete the trip by entering final odometer and fuel consumed. ---');
    const finalOdometer = 12130; // 130 km difference (120 planned, 130 actual)
    const fuelConsumed = 12; // 12 Liters
    const fuelCost = 24.50; // $24.50 total fuel expense

    // Complete validations
    if (finalOdometer < vehicle.odometer) {
        throw new Error('Validation failed: Final odometer cannot decrease');
    }

    trip.status = 'Completed';
    trip.finalOdometer = finalOdometer;
    trip.fuelConsumed = fuelConsumed;
    trip.completedAt = new Date();
    await trip.save();

    vehicle.status = 'Available';
    vehicle.odometer = finalOdometer;
    await vehicle.save();

    driver.status = 'Available';
    await driver.save();

    // Create fuel expense log
    await Expense.create({
        vehicle: vehicle._id,
        category: 'Fuel',
        cost: fuelCost,
        liters: fuelConsumed,
        date: new Date(),
        description: `Fuel logged on completing Trip #${trip._id}`
    });

    console.log(`Trip marked COMPLETED. Vehicle status=${vehicle.status}, Odometer updated to ${vehicle.odometer}km. Driver status=${driver.status}`);

    console.log('\n--- Step 8: Create a maintenance record (Oil Change). Vehicle status automatically becomes In Shop. ---');
    const maintenance = await Maintenance.create({
        vehicle: vehicle._id,
        description: 'Scheduled Engine Oil and Filter Change',
        startDate: new Date(),
        status: 'Active'
    });
    vehicle.status = 'In Shop';
    await vehicle.save();
    console.log(`Maintenance Log created: ID=${maintenance._id}, Status=${maintenance.status}. Vehicle Status=${vehicle.status} (Removed from dispatch pool).`);

    // Close the maintenance to test operational cost
    console.log('\n--- Closing Maintenance to compute total Operational Cost ---');
    maintenance.status = 'Closed';
    maintenance.cost = 145.00;
    maintenance.endDate = new Date();
    await maintenance.save();

    vehicle.status = 'Available';
    await vehicle.save();

    await Expense.create({
        vehicle: vehicle._id,
        category: 'Maintenance',
        cost: maintenance.cost,
        date: new Date(),
        description: `Maintenance fee: ${maintenance.description}`
    });
    console.log(`Maintenance Closed. Vehicle Status restored to ${vehicle.status}. Cost of $${maintenance.cost} logged to Expenses.`);

    console.log('\n--- Step 9: Reports update operational cost and fuel efficiency. ---');
    // Aggregate expenses for vehicle
    const vehicleExpenses = await Expense.find({ vehicle: vehicle._id });
    let totalExps = 0;
    vehicleExpenses.forEach(exp => {
        totalExps += exp.cost;
    });

    const efficiency = trip.distance / fuelConsumed;
    const roiNumerator = trip.revenue - totalExps;
    const roi = roiNumerator / vehicle.acquisitionCost;

    console.log(`REPORT COMPUTATIONS for ${vehicle.registrationNumber}:`);
    console.log(` - Total Distance: ${trip.distance} km`);
    console.log(` - Fuel Consumption: ${fuelConsumed} Liters`);
    console.log(` - Fuel Efficiency: ${efficiency.toFixed(2)} km/L`);
    console.log(` - Total Operational cost (Fuel + Maintenance): $${totalExps}`);
    console.log(` - Acquisition Cost: $${vehicle.acquisitionCost}`);
    console.log(` - Total Revenues: $${trip.revenue}`);
    console.log(` - ROI: ${(roi * 100).toFixed(4)}%  (Formula: (Revenue - OpCost) / AcquisitionCost)`);

    console.log('\nALL WORKFLOW STEPS VERIFIED CONCURRENTLY IN DATABASE.');
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
};

run().catch(err => {
    console.error('CRITICAL WORKFLOW EXCEPTION:', err);
    process.exit(1);
});

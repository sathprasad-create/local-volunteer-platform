require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const organisers = [
    { name: 'Olivia Organiser', email: 'organiser1@lvp.test' },
    { name: 'Omar Organiser', email: 'organiser2@lvp.test' },
];

const seed = async () => {
    if (!process.env.SEED_ORGANISER_PASSWORD) {
        console.error('SEED_ORGANISER_PASSWORD is not set in backend/.env');
        process.exit(1);
    }
    await connectDB();

    for (const o of organisers) {
        const existing = await User.findOne({ email: o.email });
        if (!existing) {
            await User.create({ ...o, password: process.env.SEED_ORGANISER_PASSWORD, role: 'organiser' });
            console.log(`created  ${o.email}`);
        } else if (existing.role !== 'organiser') {
            existing.role = 'organiser';
            await existing.save();
            console.log(`promoted ${o.email}`);
        } else {
            console.log(`exists   ${o.email}`);
        }
    }

    await mongoose.disconnect();
};

seed();
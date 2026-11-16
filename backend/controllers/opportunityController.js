const Opportunity = require('../models/Opportunity');
const { validateOpportunity } = require('../validators/opportunityValidator');

const createOpportunity = async (req, res) => {
    const errors = validateOpportunity(req.body);
    if (Object.keys(errors).length) {
        return res.status(400).json({ message: 'Please fix the highlighted fields', errors });
    }
    try {
        const { title, description, location, eventDate, closesAt, capacity } = req.body;
        const opportunity = await Opportunity.create({
            title, description, location, eventDate, closesAt, capacity, organiser: req.user._id,
        });
        res.status(201).json(opportunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({ organiser: req.user._id }).sort({ eventDate: 1 });
        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOpportunity, getMyOpportunities };
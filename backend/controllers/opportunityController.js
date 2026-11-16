const Opportunity = require('../models/Opportunity');
const { validateOpportunity } = require('../validators/opportunityValidator');
const { isClosed } = require('../utils/opportunityStatus');

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

const loadOwned = async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id).catch(() => null);
    if (!opportunity) {
        res.status(404).json({ message: 'Opportunity not found' });
        return null;
    }
    if (String(opportunity.organiser) !== String(req.user._id)) {
        res.status(403).json({ message: 'You can only change your own opportunities' });
        return null;
    }
    return opportunity;
};

const getOpportunity = async (req, res) => {
    const opportunity = await loadOwned(req, res);
    if (opportunity) res.json(opportunity);
};

const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await loadOwned(req, res);
        if (!opportunity) return;

        const errors = validateOpportunity(req.body);
        const capacity = Number(req.body.capacity);
        if (!errors.capacity && capacity < opportunity.approvedCount) {
            errors.capacity = `Capacity cannot be less than the ${opportunity.approvedCount} volunteers already approved`;
        }
        if (Object.keys(errors).length) {
            return res.status(400).json({ message: 'Please fix the highlighted fields', errors });
        }

        const { title, description, location, eventDate, closesAt } = req.body;
        Object.assign(opportunity, { title, description, location, eventDate, closesAt, capacity });
        res.json(await opportunity.save());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const closeOpportunity = async (req, res) => {
    try {
        const opportunity = await loadOwned(req, res);
        if (!opportunity) return;
        if (isClosed(opportunity)) {
            return res.status(409).json({ message: 'This opportunity is already closed' });
        }
        opportunity.closedAt = new Date();
        res.json(await opportunity.save());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOpportunity, getMyOpportunities, getOpportunity, updateOpportunity, closeOpportunity };
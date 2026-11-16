const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { isClosed } = require('../utils/opportunityStatus');

const applyToOpportunity = async (req, res) => {
    try {
        const message = (req.body.message || '').trim();
        if (message.length > 300) {
            return res.status(400).json({
                message: 'Please fix the highlighted fields',
                errors: { message: 'Message must be 300 characters or fewer' },
            });
        }

        const opportunity = await Opportunity.findById(req.params.id).catch(() => null);
        if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
        if (new Date(opportunity.eventDate) <= new Date()) {
            return res.status(409).json({ message: 'This opportunity has already taken place' });
        }
        if (isClosed(opportunity)) {
            return res.status(409).json({ message: 'Applications for this opportunity have closed' });
        }
        if (opportunity.approvedCount >= opportunity.capacity) {
            return res.status(409).json({ message: 'This opportunity is full' });
        }

        const application = await Application.create({ opportunity: opportunity._id, volunteer: req.user._id, message });
        res.status(201).json(application);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "You've already applied to this opportunity" });
        }
        res.status(500).json({ message: error.message });
    }
};

module.exports = { applyToOpportunity };
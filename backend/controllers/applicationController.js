const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { isClosed, applicationDisplayStatus } = require('../utils/opportunityStatus');
const { loadOwned } = require('./opportunityController');

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

const listApplicants = async (req, res) => {
    try {
        const opportunity = await loadOwned(req, res);
        if (!opportunity) return;
        const applications = await Application.find({ opportunity: opportunity._id })
            .populate('volunteer', 'name email')
            .sort({ createdAt: 1 });
        const closed = isClosed(opportunity);
        res.json({
            opportunity: {
                _id: opportunity._id, title: opportunity.title, capacity: opportunity.capacity,
                approvedCount: opportunity.approvedCount, status: closed ? 'closed' : 'open',
            },
            applications: applications.map((a) => ({
                _id: a._id, volunteer: a.volunteer, message: a.message, status: a.status,
                displayStatus: applicationDisplayStatus(a.status, closed),
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const decideApplication = async (req, res) => {
    try {
        const { decision } = req.body;
        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be approved or rejected' });
        }

        const application = await Application.findById(req.params.id).catch(() => null);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const opportunity = await Opportunity.findById(application.opportunity);
        if (!opportunity || String(opportunity.organiser) !== String(req.user._id)) {
            return res.status(403).json({ message: 'You can only decide applications for your own opportunities' });
        }
        if (application.status !== 'pending') {
            return res.status(409).json({ message: `This application is already ${application.status}` });
        }
        if (isClosed(opportunity)) {
            return res.status(409).json({ message: 'This opportunity is closed' });
        }
        if (decision === 'approved') {
            const filled = await Opportunity.findOneAndUpdate(
                { _id: opportunity._id, $expr: { $lt: ['$approvedCount', '$capacity'] } },
                { $inc: { approvedCount: 1 } },
                { new: true },
            );
            if (!filled) {
                return res.status(409).json({ message: `Opportunity is full (${opportunity.capacity}/${opportunity.capacity})` });
            }
        }
        const decided = await Application.findOneAndUpdate(
            { _id: application._id, status: 'pending' },
            { status: decision },
            { new: true },
        );
            if (!decided) {
               if (decision === 'approved') {
                  await Opportunity.updateOne({ _id: opportunity._id }, { $inc: { approvedCount: -1 } });
            }
            return res.status(409).json({ message: 'This application has already been decided' });
        }
        res.json(decided);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { applyToOpportunity, listApplicants, decideApplication };
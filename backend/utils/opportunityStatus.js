const isClosed = (opportunity, now = new Date()) =>
    Boolean(opportunity.closedAt) || new Date(opportunity.closesAt) <= now;

const openFilter = (now = new Date()) => ({ closedAt: null, closesAt: { $gt: now } });

module.exports = { isClosed, openFilter };
const isClosed = (opportunity, now = new Date()) =>
    Boolean(opportunity.closedAt) || new Date(opportunity.closesAt) <= now;

const openFilter = (now = new Date()) => ({ closedAt: null, closesAt: { $gt: now } });

const closedFilter = (now = new Date()) => ({
    $or: [{ closedAt: { $ne: null } }, { closesAt: { $lte: now } }],
});

const applicationDisplayStatus = (status, opportunityClosed) =>
    (opportunityClosed && status === 'pending' ? 'closed-not-selected' : status);

module.exports = { isClosed, openFilter, closedFilter, applicationDisplayStatus };

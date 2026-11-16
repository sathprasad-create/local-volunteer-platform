const { expect } = require('chai');
const sinon = require('sinon');
const Opportunity = require('../models/Opportunity');
const { getMyOpportunities } = require('../controllers/opportunityController');

describe('getMyOpportunities filter', () => {
    afterEach(() => sinon.restore());

    const run = async (query) => {
        const sort = sinon.stub().resolves([]);
        const find = sinon.stub(Opportunity, 'find').returns({ sort });
        const req = { user: { _id: 'o1' }, query };
        const res = { json: sinon.stub(), status: sinon.stub().returnsThis() };
        await getMyOpportunities(req, res);
        return find.firstCall.args[0];
    };

    it('returns all of my opportunities with no filter', async () => {
        expect(await run({})).to.deep.equal({ organiser: 'o1' });
    });

    it('adds the open conditions for status=open', async () => {
        const filter = await run({ status: 'open' });
        expect(filter).to.include({ organiser: 'o1', closedAt: null });
        expect(filter.closesAt).to.have.property('$gt');
    });

    it('adds the closed conditions for status=closed', async () => {
        const filter = await run({ status: 'closed' });
        expect(filter.organiser).to.equal('o1');
        expect(filter.$or).to.have.lengthOf(2);
    });
});
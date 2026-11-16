const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { validateOpportunity } = require('../validators/opportunityValidator');

chai.use(chaiHttp);
const { expect } = chai;

process.env.JWT_SECRET = 'test-secret';
const app = require('../server');
const User = require('../models/User');

const now = new Date('2026-11-16T00:00:00Z');
const valid = {
    title: 'Beach clean-up', description: '', location: 'Kurnell',
    eventDate: '2026-11-28', closesAt: '2026-11-26', capacity: 10,
};

describe('validateOpportunity', () => {
    it('accepts valid input', () => {
        expect(validateOpportunity(valid, now)).to.deep.equal({});
    });
    it('rejects a past event date', () => {
        expect(validateOpportunity({ ...valid, eventDate: '2026-11-01' }, now)).to.have.property('eventDate');
    });
    it('rejects a close date after the event', () => {
        expect(validateOpportunity({ ...valid, closesAt: '2026-11-29' }, now)).to.have.property('closesAt');
    });
    it('rejects capacity 0 and 101', () => {
        expect(validateOpportunity({ ...valid, capacity: 0 }, now)).to.have.property('capacity');
        expect(validateOpportunity({ ...valid, capacity: 101 }, now)).to.have.property('capacity');
    });
    it('rejects a missing title and location', () => {
        const errors = validateOpportunity({ ...valid, title: '', location: '' }, now);
        expect(errors).to.have.all.keys('title', 'location');
    });
});

describe('POST /api/opportunities', () => {
    afterEach(() => sinon.restore());

    it('returns 403 for a Volunteer token', async () => {
        sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: 'v1', role: 'volunteer' }) });
        const token = jwt.sign({ id: 'v1' }, 'test-secret');
        const res = await chai.request(app).post('/api/opportunities').set('Authorization', `Bearer ${token}`).send(valid);
        expect(res).to.have.status(403);
    });
});
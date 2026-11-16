const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { isClosed, openFilter, applicationDisplayStatus } = require('../utils/opportunityStatus');

chai.use(chaiHttp);
const { expect } = chai;

process.env.JWT_SECRET = 'test-secret';
const app = require('../server');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

const now = new Date('2026-11-16T00:00:00Z');

describe('closed status (D9)', () => {
    it('is closed when the close date has passed', () => {
        expect(isClosed({ closedAt: null, closesAt: '2026-11-10' }, now)).to.equal(true);
    });
    it('is open before the close date when not closed by hand', () => {
        expect(isClosed({ closedAt: null, closesAt: '2026-11-26' }, now)).to.equal(false);
    });
    it('is closed when closed by hand, even before the close date', () => {
        expect(isClosed({ closedAt: '2026-11-15', closesAt: '2026-11-26' }, now)).to.equal(true);
    });
    it('Browse filter only matches opportunities not closed and still before their close date', () => {
        expect(openFilter(now)).to.deep.equal({ closedAt: null, closesAt: { $gt: now } });
    });
    it('shows pending as closed, not selected on a closed opportunity and keeps approved', () => {
        expect(applicationDisplayStatus('pending', true)).to.equal('closed-not-selected');
        expect(applicationDisplayStatus('approved', true)).to.equal('approved');
        expect(applicationDisplayStatus('pending', false)).to.equal('pending');
    });
});

describe('PATCH /api/opportunities/:id/close', () => {
    afterEach(() => sinon.restore());

    const signInAs = (id) => {
        sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: id, role: 'organiser' }) });
        return jwt.sign({ id }, 'test-secret');
    };
    const existing = (overrides = {}) => ({
        _id: 'opp1', organiser: 'o1', closedAt: null, closesAt: '2030-11-26', ...overrides,
        save: sinon.stub().callsFake(async function () { return this; }),
    });

    it('closes the opportunity by setting closedAt', async () => {
        const token = signInAs('o1');
        const opp = existing();
        sinon.stub(Opportunity, 'findById').resolves(opp);
        const res = await chai.request(app).patch('/api/opportunities/opp1/close').set('Authorization', `Bearer ${token}`);
        expect(res).to.have.status(200);
        expect(res.body.closedAt).to.be.a('string');
        expect(opp.save.calledOnce).to.equal(true);
    });

    it('returns 409 when already closed', async () => {
        const token = signInAs('o1');
        sinon.stub(Opportunity, 'findById').resolves(existing({ closesAt: '2026-01-01' }));
        const res = await chai.request(app).patch('/api/opportunities/opp1/close').set('Authorization', `Bearer ${token}`);
        expect(res).to.have.status(409);
    });
    
    it('refuses to edit a closed opportunity', async () => {
        const token = signInAs('o1');
        sinon.stub(Opportunity, 'findById').resolves(existing({ closedAt: '2026-11-15' }));
        const res = await chai.request(app).put('/api/opportunities/opp1').set('Authorization', `Bearer ${token}`)
            .send({ title: 'Beach clean-up', location: 'Kurnell', eventDate: '2030-11-28', closesAt: '2030-11-26', capacity: 10 });
        expect(res).to.have.status(409);
    });
});
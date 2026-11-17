const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);
const { expect } = chai;

process.env.JWT_SECRET = 'test-secret';
const app = require('../server');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

const open = (overrides = {}) => ({
    _id: 'opp1', eventDate: '2030-11-28', closesAt: '2030-11-26', closedAt: null,
    capacity: 10, approvedCount: 0, ...overrides,
});

describe('POST /api/opportunities/:id/applications', () => {
    let token;
    beforeEach(() => {
        sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: 'v1', role: 'volunteer' }) });
        token = jwt.sign({ id: 'v1' }, 'test-secret');
    });
    afterEach(() => sinon.restore());

    const apply = (body = {}) => chai.request(app)
        .post('/api/opportunities/opp1/applications').set('Authorization', `Bearer ${token}`).send(body);

    it('creates a Pending application with an optional message', async () => {
        sinon.stub(Opportunity, 'findById').resolves(open());
        sinon.stub(Application, 'create').callsFake(async (data) => ({ ...data, status: 'pending' }));
        const res = await apply({ message: 'Happy to help' });
        expect(res).to.have.status(201);
        expect(res.body.status).to.equal('pending');
    });

    it('returns 409 for a second application', async () => {
        sinon.stub(Opportunity, 'findById').resolves(open());
        sinon.stub(Application, 'create').rejects(Object.assign(new Error('dup'), { code: 11000 }));
        const res = await apply();
        expect(res).to.have.status(409);
        expect(res.body.message).to.include("already applied");
    });

    it('returns 409 for a closed opportunity', async () => {
        sinon.stub(Opportunity, 'findById').resolves(open({ closedAt: '2026-11-15' }));
        const res = await apply();
        expect(res).to.have.status(409);
        expect(res.body.message).to.include('closed');
    });

    it('returns 409 for a past opportunity', async () => {
        sinon.stub(Opportunity, 'findById').resolves(open({ eventDate: '2026-01-10', closesAt: '2026-01-08' }));
        const res = await apply();
        expect(res).to.have.status(409);
        expect(res.body.message).to.include('already taken place');
    });

    it('returns 409 for a full opportunity', async () => {
        sinon.stub(Opportunity, 'findById').resolves(open({ approvedCount: 10 }));
        const res = await apply();
        expect(res).to.have.status(409);
        expect(res.body.message).to.include('full');
    });

    it('returns 400 for a message over 300 characters', async () => {
        const res = await apply({ message: 'x'.repeat(301) });
        expect(res).to.have.status(400);
        expect(res.body.errors).to.have.property('message');
    });
});
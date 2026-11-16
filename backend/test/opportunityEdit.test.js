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

const body = {
    title: 'Beach clean-up', description: '', location: 'Kurnell',
    eventDate: '2030-11-28', closesAt: '2030-11-26', capacity: 10,
};

const signInAs = (id) => {
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: id, role: 'organiser' }) });
    return jwt.sign({ id }, 'test-secret');
};

const existing = (overrides = {}) => ({
    _id: 'opp1', organiser: 'o1', approvedCount: 0, ...body, ...overrides,
    save: sinon.stub().callsFake(async function () { return this; }),
});

describe('PUT /api/opportunities/:id', () => {
    afterEach(() => sinon.restore());

    it('lets the owning Organiser edit', async () => {
        const token = signInAs('o1');
        sinon.stub(Opportunity, 'findById').resolves(existing());
        const res = await chai.request(app).put('/api/opportunities/opp1')
            .set('Authorization', `Bearer ${token}`).send({ ...body, title: 'Beach clean-up (am)' });
        expect(res).to.have.status(200);
        expect(res.body.title).to.equal('Beach clean-up (am)');
    });

    it('returns 403 for another Organiser', async () => {
        const token = signInAs('o2');
        sinon.stub(Opportunity, 'findById').resolves(existing());
        const res = await chai.request(app).put('/api/opportunities/opp1')
            .set('Authorization', `Bearer ${token}`).send(body);
        expect(res).to.have.status(403);
    });

    it('returns 400 with the approved count when capacity drops below it', async () => {
        const token = signInAs('o1');
        sinon.stub(Opportunity, 'findById').resolves(existing({ approvedCount: 5 }));
        const res = await chai.request(app).put('/api/opportunities/opp1')
            .set('Authorization', `Bearer ${token}`).send({ ...body, capacity: 3 });
        expect(res).to.have.status(400);
        expect(res.body.errors.capacity).to.include('5');
    });
});
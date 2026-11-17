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

const opp = (overrides = {}) => ({
    _id: 'opp1', organiser: 'o1', title: 'Beach clean-up', closedAt: null, closesAt: '2030-11-26',
    capacity: 10, approvedCount: 0, ...overrides,
});

const signInAs = (id) => {
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: id, role: 'organiser' }) });
    return jwt.sign({ id }, 'test-secret');
};

describe('Review applications', () => {
    afterEach(() => sinon.restore());

    it('lists applicants with their status for the owner', async () => {
        const token = signInAs('o1');
        sinon.stub(Opportunity, 'findById').resolves(opp());
        const sort = sinon.stub().resolves([{ _id: 'a1', volunteer: { name: 'Sam' }, message: '', status: 'pending' }]);
        sinon.stub(Application, 'find').returns({ populate: sinon.stub().returns({ sort }) });
        const res = await chai.request(app).get('/api/opportunities/opp1/applications').set('Authorization', `Bearer ${token}`);
        expect(res).to.have.status(200);
        expect(res.body.applications[0].displayStatus).to.equal('pending');
    });

    it('approves a Pending application and takes a place atomically', async () => {
        const token = signInAs('o1');
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', opportunity: 'opp1', status: 'pending' });
        sinon.stub(Opportunity, 'findById').resolves(opp());
        const fill = sinon.stub(Opportunity, 'findOneAndUpdate').resolves(opp({ approvedCount: 1 }));
        sinon.stub(Application, 'findOneAndUpdate').resolves({ _id: 'a1', status: 'approved' });
        const res = await chai.request(app).patch('/api/applications/a1/decision')
            .set('Authorization', `Bearer ${token}`).send({ decision: 'approved' });
        expect(res).to.have.status(200);
        expect(res.body.status).to.equal('approved');
        expect(fill.firstCall.args[0]).to.have.property('$expr');
    });

    it('returns 409 Opportunity is full when no place is left', async () => {
        const token = signInAs('o1');
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', opportunity: 'opp1', status: 'pending' });
        sinon.stub(Opportunity, 'findById').resolves(opp({ approvedCount: 10 }));
        sinon.stub(Opportunity, 'findOneAndUpdate').resolves(null);
        const res = await chai.request(app).patch('/api/applications/a1/decision')
            .set('Authorization', `Bearer ${token}`).send({ decision: 'approved' });
        expect(res).to.have.status(409);
        expect(res.body.message).to.include('Opportunity is full');
    });

    it('refuses to decide an application that is not Pending', async () => {
        const token = signInAs('o1');
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', opportunity: 'opp1', status: 'approved' });
        sinon.stub(Opportunity, 'findById').resolves(opp());
        const res = await chai.request(app).patch('/api/applications/a1/decision')
            .set('Authorization', `Bearer ${token}`).send({ decision: 'rejected' });
        expect(res).to.have.status(409);
    });

    it('returns 403 for another Organiser', async () => {
        const token = signInAs('o2');
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', opportunity: 'opp1', status: 'pending' });
        sinon.stub(Opportunity, 'findById').resolves(opp());
        const res = await chai.request(app).patch('/api/applications/a1/decision')
            .set('Authorization', `Bearer ${token}`).send({ decision: 'approved' });
        expect(res).to.have.status(403);
    });
});
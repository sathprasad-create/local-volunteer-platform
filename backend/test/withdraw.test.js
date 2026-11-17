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

describe('PATCH /api/applications/:id/withdraw', () => {
    let token;
    beforeEach(() => {
        sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: 'v1', role: 'volunteer' }) });
        token = jwt.sign({ id: 'v1' }, 'test-secret');
    });
    afterEach(() => sinon.restore());

    const withdraw = () => chai.request(app).patch('/api/applications/a1/withdraw').set('Authorization', `Bearer ${token}`);

    it('withdraws an Approved application and gives the place back', async () => {
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', volunteer: 'v1', opportunity: 'opp1', status: 'approved' });
        sinon.stub(Opportunity, 'findById').resolves({ _id: 'opp1', eventDate: '2030-11-28' });
        sinon.stub(Application, 'findOneAndUpdate').resolves({ _id: 'a1', status: 'withdrawn' });
        const giveBack = sinon.stub(Opportunity, 'updateOne').resolves({});
        const res = await withdraw();
        expect(res).to.have.status(200);
        expect(res.body.status).to.equal('withdrawn');
        expect(giveBack.firstCall.args[1]).to.deep.equal({ $inc: { approvedCount: -1 } });
    });

    it('refuses to withdraw after the event date', async () => {
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', volunteer: 'v1', opportunity: 'opp1', status: 'pending' });
        sinon.stub(Opportunity, 'findById').resolves({ _id: 'opp1', eventDate: '2026-01-10' });
        const res = await withdraw();
        expect(res).to.have.status(409);
    });

    it('returns 404 for someone else\'s application', async () => {
        sinon.stub(Application, 'findById').resolves({ _id: 'a1', volunteer: 'v2', opportunity: 'opp1', status: 'pending' });
        const res = await withdraw();
        expect(res).to.have.status(404);
    });
});
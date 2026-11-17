const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);
const { expect } = chai;

process.env.JWT_SECRET = 'test-secret';
const app = require('../server');
const User = require('../models/User');
const Application = require('../models/Application');

describe('GET /api/applications/mine', () => {
    afterEach(() => sinon.restore());

    it('lists my applications including closed ones with their display status', async () => {
        sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: 'v1', role: 'volunteer' }) });
        const token = jwt.sign({ id: 'v1' }, 'test-secret');
        const sort = sinon.stub().resolves([{
            _id: 'a1', status: 'pending',
            opportunity: { _id: 'opp1', title: 'Park planting', closedAt: '2026-11-10', closesAt: '2026-11-12' },
        }]);
        sinon.stub(Application, 'find').returns({ populate: sinon.stub().returns({ sort }) });
        const res = await chai.request(app).get('/api/applications/mine').set('Authorization', `Bearer ${token}`);
        expect(res).to.have.status(200);
        expect(res.body[0].displayStatus).to.equal('closed-not-selected');
    });
});
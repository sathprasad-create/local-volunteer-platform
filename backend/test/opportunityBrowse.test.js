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

const signInAs = (id, role) => {
    sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves({ _id: id, role }) });
    return jwt.sign({ id }, 'test-secret');
};

describe('GET /api/opportunities (Browse)', () => {
    afterEach(() => sinon.restore());

    it('lists only open opportunities for a Volunteer', async () => {
        const token = signInAs('v1', 'volunteer');
        const sort = sinon.stub().resolves([{ title: 'Beach clean-up', capacity: 10, approvedCount: 4 }]);
        const find = sinon.stub(Opportunity, 'find').returns({ select: sinon.stub().returns({ sort }) });
        const res = await chai.request(app).get('/api/opportunities').set('Authorization', `Bearer ${token}`);
        expect(res).to.have.status(200);
        expect(res.body).to.have.lengthOf(1);
        const filter = find.firstCall.args[0];
        expect(filter.closedAt).to.equal(null);
        expect(filter.closesAt).to.have.property('$gt');
    });

    it('returns 403 for an Organiser', async () => {
        const token = signInAs('o1', 'organiser');
        const res = await chai.request(app).get('/api/opportunities').set('Authorization', `Bearer ${token}`);
        expect(res).to.have.status(403);
    });
});
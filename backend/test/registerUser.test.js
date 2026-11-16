const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User');
const { registerUser } = require('../controllers/authController');

describe('registerUser', () => {
    afterEach(() => sinon.restore());

    it('creates a Volunteer even when the request asks for organiser', async () => {
        process.env.JWT_SECRET = 'test-secret';
        sinon.stub(User, 'findOne').resolves(null);
        const create = sinon.stub(User, 'create').callsFake(async (data) => ({ id: 'u1', ...data }));
        const req = { body: { name: 'Mal', email: 'mal@test.com', password: 'secret123', role: 'organiser' } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

        await registerUser(req, res);

        expect(create.firstCall.args[0].role).to.equal('volunteer');
        expect(res.status.calledWith(201)).to.equal(true);
        expect(res.json.firstCall.args[0].role).to.equal('volunteer');
    });
});
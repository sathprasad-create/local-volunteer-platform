const { expect } = require('chai');
const sinon = require('sinon');
const { authorise } = require('../middleware/authMiddleware');

describe('authorise', () => {
    const run = (role) => {
        const req = { user: { role } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
        const next = sinon.spy();
        authorise('organiser')(req, res, next);
        return { res, next };
    };

    it('returns 403 for a Volunteer on an Organiser route', () => {
        const { res, next } = run('volunteer');
        expect(res.status.calledWith(403)).to.equal(true);
        expect(next.called).to.equal(false);
    });

    it('lets an Organiser through', () => {
        const { res, next } = run('organiser');
        expect(next.calledOnce).to.equal(true);
        expect(res.status.called).to.equal(false);
    });
});
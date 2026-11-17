const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const { decideApplication, listMyApplications } = require('../controllers/applicationController');

const router = express.Router();

router.patch('/:id/decision', protect, authorise('organiser'), decideApplication);
router.get('/mine', protect, authorise('volunteer'), listMyApplications);

module.exports = router;
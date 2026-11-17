const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const { decideApplication, listMyApplications, withdrawApplication } = require('../controllers/applicationController');
const router = express.Router();

router.patch('/:id/decision', protect, authorise('organiser'), decideApplication);
router.get('/mine', protect, authorise('volunteer'), listMyApplications);
router.patch('/:id/withdraw', protect, authorise('volunteer'), withdrawApplication);

module.exports = router;
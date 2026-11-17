const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const { decideApplication } = require('../controllers/applicationController');

const router = express.Router();

router.patch('/:id/decision', protect, authorise('organiser'), decideApplication);

module.exports = router;
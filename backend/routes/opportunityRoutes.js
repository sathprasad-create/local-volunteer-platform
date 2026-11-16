const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const { createOpportunity, getMyOpportunities } = require('../controllers/opportunityController');

const router = express.Router();

router.post('/', protect, authorise('organiser'), createOpportunity);
router.get('/mine', protect, authorise('organiser'), getMyOpportunities);

module.exports = router;
const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const {
    createOpportunity, getMyOpportunities, getOpportunity, updateOpportunity, closeOpportunity,
} = require('../controllers/opportunityController');

const router = express.Router();

router.post('/', protect, authorise('organiser'), createOpportunity);
router.get('/mine', protect, authorise('organiser'), getMyOpportunities);
router.get('/:id', protect, authorise('organiser'), getOpportunity);
router.put('/:id', protect, authorise('organiser'), updateOpportunity);
router.patch('/:id/close', protect, authorise('organiser'), closeOpportunity);

module.exports = router;
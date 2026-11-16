const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const {
        createOpportunity, getMyOpportunities, browseOpportunities, getOpportunity, updateOpportunity, closeOpportunity,
} = require('../controllers/opportunityController');
const { applyToOpportunity } = require('../controllers/applicationController');
const router = express.Router();

router.post('/', protect, authorise('organiser'), createOpportunity);
router.get('/', protect, authorise('volunteer'), browseOpportunities);
router.get('/mine', protect, authorise('organiser'), getMyOpportunities);
router.get('/:id', protect, authorise('organiser'), getOpportunity);
router.put('/:id', protect, authorise('organiser'), updateOpportunity);
router.patch('/:id/close', protect, authorise('organiser'), closeOpportunity);
router.post('/:id/applications', protect, authorise('volunteer'), applyToOpportunity);
module.exports = router;
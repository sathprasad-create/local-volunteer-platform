const express = require('express');
const { protect, authorise } = require('../middleware/authMiddleware');
const {
        createOpportunity, getMyOpportunities, browseOpportunities, viewOpportunity, getOpportunity, updateOpportunity, closeOpportunity,
} = require('../controllers/opportunityController');
const { applyToOpportunity, listApplicants } = require('../controllers/applicationController');
const router = express.Router();

router.post('/', protect, authorise('organiser'), createOpportunity);
router.get('/', protect, authorise('volunteer'), browseOpportunities);
router.get('/mine', protect, authorise('organiser'), getMyOpportunities);
router.get('/:id', protect, authorise('organiser'), getOpportunity);
router.get('/:id/view', protect, authorise('volunteer'), viewOpportunity);
router.put('/:id', protect, authorise('organiser'), updateOpportunity);
router.patch('/:id/close', protect, authorise('organiser'), closeOpportunity);
router.post('/:id/applications', protect, authorise('volunteer'), applyToOpportunity);
router.get('/:id/applications', protect, authorise('organiser'), listApplicants);
module.exports = router;
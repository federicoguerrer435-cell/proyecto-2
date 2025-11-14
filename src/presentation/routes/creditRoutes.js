const express = require('express');
const router = express.Router();
const creditsController = require('../controllers/CreditsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

// Base: /api/credits
router.use(authMiddleware);

router.get('/', authorize('credits.read'), creditsController.index);
router.post('/', authorize('credits.create'), creditsController.store);
router.get('/:id', authorize('credits.read'), creditsController.show);
router.post('/:id/approve', authorize('credits.approve'), creditsController.approve);
router.post('/:id/reject', authorize('credits.reject'), creditsController.reject);

module.exports = router;

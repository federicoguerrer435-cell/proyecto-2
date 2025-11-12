const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/ClientsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authorize');

// Base: /api/clients
router.use(authMiddleware);

router.get('/', authorize('clients.read'), clientsController.index);
router.get('/:id', authorize('clients.read'), clientsController.show);
router.post('/', authorize('clients.create'), clientsController.store);
router.put('/:id', authorize('clients.update'), clientsController.update);
router.delete('/:id', authorize('clients.delete'), clientsController.destroy);

module.exports = router;

const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');

const clientController = new ClientController();

router.post('/register', (req, res) => clientController.registerClient(req, res));
router.get('/', (req, res) => clientController.getClients(req, res));

module.exports = router;

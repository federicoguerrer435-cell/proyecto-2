const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');
const asyncHandler = require('../middlewares/asyncHandler');

const createClientUseCase = require('../../application/use-cases/CreateClientUseCase');
const listClientsUseCase = require('../../application/use-cases/ListClientsUseCase');
const getClientByIdUseCase = require('../../application/use-cases/GetClientByIdUseCase');
const updateClientUseCase = require('../../application/use-cases/UpdateClientUseCase');
const deleteClientUseCase = require('../../application/use-cases/DeleteClientUseCase');

class ClientsController {
  index = [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número válido'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
    query('nombre').optional().trim(),
    query('cedula').optional().trim(),
    query('telefono').optional().trim(),
    query('email').optional().isEmail().withMessage('Email inválido'),
    query('isActive').optional().isBoolean().withMessage('isActive debe ser true o false'),
    validate,

    asyncHandler(async (req, res) => {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        nombre: req.query.nombre,
        cedula: req.query.cedula,
        telefono: req.query.telefono,
        email: req.query.email,
        isActive: req.query.isActive
      };

      const result = await listClientsUseCase.execute(filters);
      res.json({ success: true, data: result.clients, meta: { total: result.total } });
    })
  ];

  show = [
    param('id').isInt().withMessage('ID inválido'),
    validate,
    asyncHandler(async (req, res) => {
      const client = await getClientByIdUseCase.execute(req.params.id);
      res.json({ success: true, data: client });
    })
  ];

  store = [
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('cedula').notEmpty().withMessage('Cédula es requerida'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('telefono').optional().trim(),
    validate,

    asyncHandler(async (req, res) => {
      // Debug: log incoming payload and user to help trace server 500
      try {
        console.log('ClientsController.store - req.body:', JSON.stringify(req.body));
        console.log('ClientsController.store - req.user:', JSON.stringify(req.user));

        const createdBy = req.user?.userId || req.user?.id || null;
        const client = await createClientUseCase.execute(req.body, createdBy);
        res.status(201).json({ success: true, data: client });
      } catch (err) {
        console.error('ClientsController.store error:', err);
        throw err; // let global error handler format the response
      }
    })
  ];

  update = [
    param('id').isInt().withMessage('ID inválido'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('nombre').optional().trim(),
    body('telefono').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive debe ser true o false'),
    validate,

    asyncHandler(async (req, res) => {
      const updatedBy = req.user?.userId || req.user?.id || null;
      const updated = await updateClientUseCase.execute(req.params.id, req.body, updatedBy);
      res.json({ success: true, data: updated });
    })
  ];

  destroy = [
    param('id').isInt().withMessage('ID inválido'),
    validate,

    asyncHandler(async (req, res) => {
      const deletedBy = req.user?.userId || req.user?.id || null;
      const result = await deleteClientUseCase.execute(req.params.id, deletedBy);
      res.json({ success: true, message: result.message });
    })
  ];
}

module.exports = new ClientsController();

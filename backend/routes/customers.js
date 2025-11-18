const { body, param, validationResult } = require('express-validator');
const router = require('express').Router();
const customerController = require('../controllers/customers');

// Middleware para capturar erros de validação
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: errors.array().map(e => ({
        field: e.param,
        message: e.msg
      }))
    });
  }
  next();
};

// Regra de validação para ID MongoDB
const validateId = [
  param('id')
    .exists().withMessage('ID is required.')
    .isLength({ min: 24, max: 24 }).withMessage('ID must be 24 characters long.')
    .isHexadecimal().withMessage('ID must be a valid hexadecimal string.')
];

// Regras de validação para POST e PUT
const validateRulesPostAndPut = [

  body().custom(value => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('Request body cannot be empty');
    }
    return true;
  }),

  body('firstName')
    .notEmpty().withMessage('First name is required.')
    .isString().withMessage('First name must be a string.'),

  body('lastName')
    .notEmpty().withMessage('Last name is required.')
    .isString().withMessage('Last name must be a string.'),

  body('email')
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email format.'),

  body('contact')
    .optional()
    .isString().withMessage('Contact must be a string.'),

  body('address.street')
    .notEmpty().withMessage('Street is required.')
    .isString().withMessage('Street must be a string.'),

  body('address.city')
    .notEmpty().withMessage('City is required.')
    .isString().withMessage('City must be a string.'),

  body('address.state')
    .notEmpty().withMessage('State is required.')
    .isString().withMessage('State must be a string.'),

  body('address.zipcode')
    .notEmpty().withMessage('Zipcode is required.')
    .isString().withMessage('Zipcode must be a string.'),
];

// Rotas
router.get('/all', customerController.getAllData);

router.get('/:id', validateId, handleValidation, customerController.getClientById);

router.post('/', validateRulesPostAndPut, handleValidation, customerController.createClient);

router.put('/:id', validateId, validateRulesPostAndPut, handleValidation, customerController.updateClient);

router.delete('/:id', validateId, handleValidation, customerController.deleteClient);

module.exports = router;

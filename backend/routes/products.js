const { body, param, validationResult } = require('express-validator');
const router = require('express').Router();
const productsController = require('../controllers/products');

// ------------------------------
// Middleware para capturar erros
// ------------------------------
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

// ---------------------------------------------
// Validação para ID do MongoDB
// ---------------------------------------------
const validateId = [
  param('id')
    .exists().withMessage('ID is required.')
    .isLength({ min: 24, max: 24 }).withMessage('ID must be 24 characters long.')
    .isHexadecimal().withMessage('ID must be a valid hexadecimal string.')
];

// ---------------------------------------------
// Validações para POST e PUT
// ---------------------------------------------
const validateProductRules = [

  body().custom(value => {
    if (!value || Object.keys(value).length === 0) {
      throw new Error('Request body cannot be empty.');
    }
    return true;
  }),

  body('name')
    .notEmpty().withMessage('Product name is required.')
    .isString().withMessage('Product name must be a string.'),

  body('description')
    .notEmpty().withMessage('Description is required.')
    .isString().withMessage('Description must be a string.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),

  body('category')
    .notEmpty().withMessage('Category is required.')
    .isString().withMessage('Category must be a string.'),

  body('stock')
    .notEmpty().withMessage('Stock value is required.')
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer.'),

  body('sku')
    .notEmpty().withMessage('SKU is required.')
    .isString().withMessage('SKU must be a string.'),

  body('createdAt')
    .optional()
    .isISO8601().withMessage('createdAt must be a valid date format.')
];

// ------------------------------
// Rotas para /products
// ------------------------------

router.get('/all', productsController.getAllProducts);

router.get('/:id', validateId, handleValidation, productsController.getProductById);

router.post('/', validateProductRules, handleValidation, productsController.createProduct);

router.put('/:id', validateId, validateProductRules, handleValidation, productsController.updateProduct);

router.delete('/:id', validateId, handleValidation, productsController.deleteProduct);

module.exports = router;

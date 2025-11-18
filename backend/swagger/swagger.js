const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Estevas Garden API',
    description: 'Automatic Swagger docs',
  },
  host: 'localhost:8080',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';

const routes = ['./backend/routes/customers.js',
               './backend/routes/products.js'];


swaggerAutogen(outputFile, routes, doc).then(() => {
    require('../server.js')
});
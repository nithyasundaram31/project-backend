const express = require('express');

const { getResultById } = require('../controllers/resultController');
const authenticate = require('../middlewares/auth');

const resultRouter = express.Router();
resultRouter.get('/:id', authenticate(), getResultById);


module.exports = resultRouter;
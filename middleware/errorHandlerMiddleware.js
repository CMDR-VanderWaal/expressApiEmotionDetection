// errorHandlerMiddleware.js
//const constants = require('../constants'); // Define your error constants here
/*
const handleError = (err, req, res, next) => {
  const status = res.statusCode ? res.statusCode : constants.SERVER_ERR;
  switch (status) {
    case constants.VALIDATION_ERR:
      res.status(status).json({
        title: 'Validation FAILED',
        message: err.message,
        stackTrace: err.stack
      });
      break;
    case constants.NOT_FOUND:
      res.status(status).json({
        title: 'NOT FOUND ERR',
        message: err.message,
        stackTrace: err.stack
      });
      break;
    // Add more error cases as needed
    default:
      console.error('Unhandled error:', err);
      res.status(constants.SERVER_ERR).json({
        title: 'Server ERROR',
        message: 'An unexpected error occurred. idk wat to do',
        stackTrace: err.stack
      });
  }
}; */

module.exports = {
  handleError
};

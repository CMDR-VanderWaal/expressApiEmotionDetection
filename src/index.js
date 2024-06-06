const express = require('express');
const functions =require("firebase-functions")

const bodyParser = require('body-parser');
const customerRoutes = require('./routes/customerRoutes');
const dateRoutes = require('./routes/dateRoutes');
const overallSatisfactionRoutes = require('./routes/overallSatisfactionRoutes');

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/customers', customerRoutes);
app.use('/api/date-range', dateRoutes);
app.use('/api/overall-satisfaction', overallSatisfactionRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

exports.api = functions.https.onRequest(app);
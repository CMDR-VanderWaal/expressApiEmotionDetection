const admin = require('firebase-admin');
const serviceAccount = require('../../sensorsprok-firebase-adminsdk-8lypo-e3c3dc0569.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://(default).firebaseio.com'
});

module.exports = admin;
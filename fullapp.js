const express = require('express');
const admin = require('firebase-admin');

const functions =require("firebase-functions")
const app = express();
const port = 3002; // You can change this to your preferred port

// Initialize Firebase Admin SDK with your service account JSON file
const serviceAccount = require('./sensorsprok-firebase-adminsdk-8lypo-862938d9d5.json'); // Replace with your actual file path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://(default).firebaseio.com' // Replace with your Firestore database URL
});

// Your API routes will go here
app.use(express.json())
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


app.get('/api/customer-satisfaction-data/', async (req, res) => {
  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();
    
    const jsonData = [];
    const emotionCounts = {}; // Initialize emotion counts object
    let emotions = [] ; 
    const emotionPercents = {};
    let total = 0;

    // Iterate through the customer collection
    for (const customerDoc of customerCollection.docs) {
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;

      // Create an object for this customer
      const customerObject = {
        customerId,
        ...customerData,
        datewise: [],
      };

      // Access the datewise subcollection for this customer
      const datewiseCollection = await admin
        .firestore()
        .collection('customer-satisfaction-data')
        .doc(customerId)
        .collection('datewise')
        .get();
      
      // Iterate through the datewise subcollection
      datewiseCollection.forEach((datewiseDoc) => {
        const datewiseData = datewiseDoc.data();
        const datewiseId = datewiseDoc.id;

        // Add datewise data to the customer object
        customerObject.datewise.push({
          datewiseId,
          ...datewiseData,
        });
        
        if ('emotion-data' in datewiseData) {
          // Push the emotions from the document to the emotions array
          emotions.push(...datewiseData['emotion-data']);
          //datewiseData['emotion-data'].forEach((emotion))
        }
      });
      
      emotions.forEach((emotion) => {
        // Increment the count for each emotion
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        total=total+1;
      });
      emotions = []
      
      
      // Add the customer object to the JSON array
      jsonData.push(customerObject);
    }
    //console.log(total);
    const keys = Object.keys(emotionCounts);
    keys.forEach((emotion)=>{
      //console.log(emotionCounts[emotion])
      emotionPercents[emotion]=((emotionCounts[emotion]*100)/total);
    })

    res.status(200).json({ jsonData, emotionCounts ,emotionPercents}); // Include emotion counts in the response
  } catch (error) {
    console.error('Error fetching all customer data:', error);
    res.status(500).json({ error: 'Error fetching all customer data' });
  }
});

app.get('/api/customer-satisfaction-data/customer/:customerName', async (req, res) => {
  try {
    const customerName = req.params.customerName;
    const querySnapshot = await admin
      .firestore()
      .collection('customer-satisfaction-data')
      .doc(`${customerName}_emotionData`)
      .collection('datewise')
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const data = [];
    const emotionCounts = {};
    let emotions = [];
    let total = 0;

    querySnapshot.forEach((doc) => {
      const datewiseData = doc.data();

      if ('emotion-data' in datewiseData) {
        emotions.push(...datewiseData['emotion-data']);
      }
    });

    emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      total = total + 1;
    });

    const emotionPercents = {};
    const keys = Object.keys(emotionCounts);
    keys.forEach((emotion) => {
      emotionPercents[emotion] = (emotionCounts[emotion] * 100) / total;
    });

    res.status(200).json({ data, emotionCounts, emotionPercents });
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).json({ error: 'Error loading customer data' });
  }
});

app.get('/api/customer-satisfaction-data/date/:startDate/:endDate', async (req, res) => {
  try {
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const datewiseCollection = admin.firestore().collectionGroup('datewise');
    const data = [];
    const emotionCounts = {};
    let emotions = [];
    let total = 0;

    const querySnapshot = await datewiseCollection.get();
    querySnapshot.forEach((doc) => {
      const datewiseData = doc.data();
      const docDate = doc.id;

      if (docDate >= startDate && docDate <= endDate && 'emotion-data' in datewiseData) {
        emotions.push(...datewiseData['emotion-data']);
      }
    });

    emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      total = total + 1;
    });

    const emotionPercents = {};
    const keys = Object.keys(emotionCounts);
    keys.forEach((emotion) => {
      emotionPercents[emotion] = (emotionCounts[emotion] * 100) / total;
    });

    res.status(200).json({ data, emotionCounts, emotionPercents });
  } catch (error) {
    console.error('Error fetching emotion data by date range:', error);
    res.status(500).json({ error: 'Error fetching emotion data by date range' });
  }
});




exports.api = functions.https.onRequest(app)
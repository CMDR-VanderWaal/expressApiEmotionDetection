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
    const emotionCounts = {}; // Initialize   emotion counts object
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
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });

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
    const datewiseEmotionCounts = {}; // To store counts for each date.
    const emotions = []; // To store all emotions within the date range.
    const totalEmotionCounts = {}; // To store counts for the overall range.

    const querySnapshot = await datewiseCollection.get();
    querySnapshot.forEach((doc) => {
      const datewiseData = doc.data();
      const docDate = doc.id;

      if (docDate >= startDate && docDate <= endDate && 'emotion-data' in datewiseData) {
        data.push(datewiseData);

        // Update emotion counts for each date.
        if (!datewiseEmotionCounts[docDate]) {
          datewiseEmotionCounts[docDate] = {};
        }

        datewiseData['emotion-data'].forEach((emotion) => {
          emotions.push(emotion);
          // Update counts for the specific date.
          datewiseEmotionCounts[docDate][emotion] = (datewiseEmotionCounts[docDate][emotion] || 0) + 1;
          // Update counts for the overall range.
          totalEmotionCounts[emotion] = (totalEmotionCounts[emotion] || 0) + 1;
        });
      }
    });

    const uniqueDates = Object.keys(datewiseEmotionCounts);

    const emotionPercents = {};

    uniqueDates.forEach((date) => {
      emotionPercents[date] = {};
      const keys = Object.keys(datewiseEmotionCounts[date]);
      keys.forEach((emotion) => {
        emotionPercents[date][emotion] = (datewiseEmotionCounts[date][emotion] * 100) / emotions.length;
      });
    });

    // Calculate emotionPercents for the overall range.
    const overallEmotionPercents = {};
    const keys = Object.keys(totalEmotionCounts);
    keys.forEach((emotion) => {
      overallEmotionPercents[emotion] = (totalEmotionCounts[emotion] * 100) / emotions.length;
    });

    res.status(200).json({ data, datewiseEmotionCounts, emotionPercents, overallEmotionPercents });
  } catch (error) {
    console.error('Error fetching emotion data by date range:', error);
    res.status(500).json({ error: 'Error fetching emotion data by date range' });
  }
});

app.get('/api/customer-satisfaction-data/customers', async (req, res) => {
  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();
    const customers = [];

    customerCollection.forEach((doc) => {
      const customerData = doc.data();
      const customerName = customerData['Customer-name']; // Get the customer name from the document data
      const customerId = customerData['customer-id']; // Get the customer ID from the document data
      customers.push({ customerName, customerId });
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customer list:', error);
    res.status(500).json({ error: 'Error fetching customer list' });
  }
});

app.get('/api/customer-satisfaction-data/customers/overallSatisfaction', async (req, res) => {
  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();

    let positiveCustomers = 0;
    let neutralCustomers = 0;
    let negativeCustomers = 0;
    
    const customerPromises = customerCollection.docs.map(async (customerDoc) => {
      const customerData = customerDoc.data();
      const customerId = customerDoc.id;

      const customerObject = {
        customerId,
        ...customerData,
        datewise: [],
      };

      const datewiseCollection = await admin
        .firestore()
        .collection('customer-satisfaction-data')
        .doc(customerId)
        .collection('datewise')
        .get();

      let isPositive = 0;
      let isNeutral = 0;
      let isNegative = 0;

      datewiseCollection.forEach((datewiseDoc) => {
        const datewiseData = datewiseDoc.data();
        if ('emotion-data' in datewiseData) {
          const emotions = datewiseData['emotion-data'];

          // Implement your classification logic here
          const positiveEmotions = emotions.filter((emotion) => emotion === "Happy");
          const neutralEmotions = emotions.filter((emotion) => emotion === "Neutral" || emotion === "Surprised");
          const negativeEmotions = emotions.filter((emotion) => emotion === "Angry");

          if (
            positiveEmotions.length > neutralEmotions.length + negativeEmotions.length &&
            positiveEmotions.length > negativeEmotions.length
          ) {
            isPositive++;
          } else if (
            neutralEmotions.length >= positiveEmotions.length && neutralEmotions.length >= negativeEmotions.length
          ) {
            isNeutral++;
          } else {
            isNegative++;
          }
        }

        customerObject.datewise.push({
          datewiseId: datewiseDoc.id,
          ...datewiseData,
        });
      });

      if (isPositive > isNeutral && isPositive > isNegative) {
        positiveCustomers++;
      } else if (isNeutral >= isPositive && isNeutral >= isNegative) {
        neutralCustomers++;
      } else {
        negativeCustomers++;
      }

      return {
        customerObject,
      };
    });

    await Promise.all(customerPromises);

    res.status(200).json({
      positiveCustomers,
      neutralCustomers,
      negativeCustomers,
    });
  } catch (error) {
    console.error('Error fetching customer satisfaction data:', error);
    res.status(500).json({ error: 'Error fetching customer satisfaction data' }); 
  }
});



exports.api = functions.https.onRequest(app);


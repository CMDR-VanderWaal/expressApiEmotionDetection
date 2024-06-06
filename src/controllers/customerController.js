const admin = require('../middlewares/firebaseMiddleware');

const getAllCustomersData = async (req, res) => {
  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();
    
    const jsonData = [];
    const emotionCounts = {}; 
    let emotions = []; 
    const emotionPercents = {};
    let total = 0;

    for (const customerDoc of customerCollection.docs) {
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
      
      datewiseCollection.forEach((datewiseDoc) => {
        const datewiseData = datewiseDoc.data();
        const datewiseId = datewiseDoc.id;

        customerObject.datewise.push({
          datewiseId,
          ...datewiseData,
        });
        
        if ('emotion-data' in datewiseData) {
          emotions.push(...datewiseData['emotion-data']);
        }
      });
      
      emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        total += 1;
      });
      emotions = [];
      
      jsonData.push(customerObject);
    }

    const keys = Object.keys(emotionCounts);
    keys.forEach((emotion)=>{
      emotionPercents[emotion] = ((emotionCounts[emotion] * 100) / total);
    });

    res.status(200).json({ jsonData, emotionCounts, emotionPercents });
  } catch (error) {
    console.error('Error fetching all customer data:', error);
    res.status(500).json({ error: 'Error fetching all customer data' });
  }
};

const getCustomerDataByName = async (req, res) => {
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
      total += 1;
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
};

const getAllCustomers = async (req, res) => {
  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();
    const customers = [];

    customerCollection.forEach((doc) => {
      const customerData = doc.data();
      const customerName = customerData['Customer-name'];
      const customerId = customerData['customer-id'];
      customers.push({ customerName, customerId });
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customer list:', error);
    res.status(500).json({ error: 'Error fetching customer list' });
  }
};

module.exports = {
  getAllCustomersData,
  getCustomerDataByName,
  getAllCustomers,
};
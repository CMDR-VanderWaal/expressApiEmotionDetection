const admin = require('../middlewares/firebaseMiddleware');

const getOverallSatisfactionData = async (req, res) => {
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

          const positiveEmotions = emotions.filter((emotion) => emotion === "Happy");
          const neutralEmotions = emotions.filter((emotion) => emotion === "Neutral" || emotion === "Surprised");
          const negativeEmotions = emotions.filter((emotion) => emotion === "Angry");

          if (positiveEmotions.length > neutralEmotions.length + negativeEmotions.length &&
              positiveEmotions.length > negativeEmotions.length) {
            isPositive++;
          } else if (neutralEmotions.length >= positiveEmotions.length && 
                     neutralEmotions.length >= negativeEmotions.length) {
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

      return { customerObject };
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
};

module.exports = {
  getOverallSatisfactionData,
};
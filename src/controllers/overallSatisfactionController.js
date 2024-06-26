const admin = require('../middlewares/firebaseMiddleware');

const emotionWeights = {
  "Happy": 1.0,
  "Sad": 0.5,
  "Neutral": 0.7,
  "Angry": 0.2,
  "Surprised": 0.9,
  "Fearful": 0.3,
  "Disgusted": 0.1,
};

const getOverallSatisfactionData = async (req, res) => {
  try {
    const customerCollection = await admin.firestore().collection('customer-satisfaction-data').get();

    const overallEmotionCounts = {};
    const overallWeightedEmotionCounts = {};
    const datewiseEmotionData = {};
    let totalEmotions = 0;
    let totalWeightedEmotions = 0;

    const customerPromises = customerCollection.docs.map(async (customerDoc) => {
      const customerId = customerDoc.id;
      const datewiseCollection = await admin
        .firestore()
        .collection('customer-satisfaction-data')
        .doc(customerId)
        .collection('datewise')
        .get();

      datewiseCollection.forEach((datewiseDoc) => {
        const datewiseData = datewiseDoc.data();
        const date = datewiseDoc.id;

        if ('emotion-data' in datewiseData) {
          const emotions = datewiseData['emotion-data'];

          if (!datewiseEmotionData[date]) {
            datewiseEmotionData[date] = {};
          }

          emotions.forEach((emotion) => {
            overallEmotionCounts[emotion] = (overallEmotionCounts[emotion] || 0) + 1;
            const weight = emotionWeights[emotion] || 1.0;
            overallWeightedEmotionCounts[emotion] = (overallWeightedEmotionCounts[emotion] || 0) + weight;
            totalEmotions += 1;
            totalWeightedEmotions += weight;

            datewiseEmotionData[date][emotion] = (datewiseEmotionData[date][emotion] || 0) + weight;
          });
        }
      });
    });

    await Promise.all(customerPromises);

    const overallEmotionPercents = {};
    const overallWeightedEmotionPercents = {};
    Object.keys(overallEmotionCounts).forEach((emotion) => {
      overallEmotionPercents[emotion] = (overallEmotionCounts[emotion] * 100) / totalEmotions;
      overallWeightedEmotionPercents[emotion] = (overallWeightedEmotionCounts[emotion] * 100) / totalWeightedEmotions;
    });

    const datewiseData = Object.keys(datewiseEmotionData).map((date) => {
      const weightedEmotionPercents = {};
      const totalDatewiseWeightedEmotions = Object.values(datewiseEmotionData[date]).reduce((a, b) => a + b, 0);
      
      Object.keys(datewiseEmotionData[date]).forEach((emotion) => {
        weightedEmotionPercents[emotion] = (datewiseEmotionData[date][emotion] * 100) / totalDatewiseWeightedEmotions;
      });

      return {
        date,
        weightedEmotionPercents,
      };
    });

    // Calculate Overall Sentiment Score
    const overallSentimentScore = calculateOverallSentiment(overallWeightedEmotionPercents);

    res.status(200).json({
      data: datewiseData,
      emotionCounts: overallEmotionCounts,
      emotionPercents: overallEmotionPercents,
      weightedEmotionPercents: overallWeightedEmotionPercents,
      overallSentimentScore,
    });
  } catch (error) {
    console.error('Error fetching customer satisfaction data:', error);
    res.status(500).json({ error: 'Error fetching customer satisfaction data' });
  }
};

// Function to calculate Overall Sentiment Score
const calculateOverallSentiment = (weightedEmotionPercents) => {
  const positiveScore = (weightedEmotionPercents["Happy"] || 0) +
                        (weightedEmotionPercents["Surprised"] || 0) +
                        (weightedEmotionPercents["Neutral"] || 0) * 0.5; // Adjusted weight for Neutral
  const negativeScore = (weightedEmotionPercents["Angry"] || 0) +
                        (weightedEmotionPercents["Sad"] || 0) * 0.5 +  // Adjusted weight for Sad
                        (weightedEmotionPercents["Fearful"] || 0) * 0.3 +  // Adjusted weight for Fearful
                        (weightedEmotionPercents["Disgusted"] || 0) * 0.1;  // Adjusted weight for Disgusted
  
  const overallScore = positiveScore - negativeScore;
  return overallScore.toFixed(2);
};

module.exports = {
  getOverallSatisfactionData,
};

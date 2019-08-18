const express = require('express');
const app = express();

const exampleData = require('../data/tracking.json');

// Store the timestamp in the example data object
exampleData.forEach(data => {
  data.timestamp = new Date(data.time).getTime();
});

// Sort the example data by the timestamp
// It will be usefull in the search
// Done here to do it one time over running the app - not with every request
exampleData.sort((a, b) => a.timestamp - b.timestamp);

// A function which loops over the data to closest one to the required time
function getClosestTime(data, when) {
  when = Number(when);

  let closestTimeData = undefined;
  let minTimestampDiff = 999999999999;

  data.forEach((curData) => {
    const currDiff = Math.abs(Number(curData.timestamp) - when);
    if (currDiff < minTimestampDiff) {
      minTimestampDiff = currDiff;
      closestTimeData = curData;
    }
  });

  return closestTimeData;
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (req, res) => {
  // Generate array of trips
  // Every trip will contain array of data points
  // As the data is static we can do this step outside the request function run it one time
  // But in this way it will be usefull when have different drivers data, there we can use the caching
  const trips = [];

  trips.push([]);
  let lastTimeStamp = exampleData[0].timestamp;

  exampleData.forEach(data => {
    // if the timestamp difference is more than 20 minuts start a new trip
    if (data.timestamp - lastTimeStamp > 20 * 60 * 1000) {
      trips.push([]);
    }
    trips[trips.length - 1].push(data);
    lastTimeStamp = data.timestamp;
  });

  res.send(trips)
})

app.get('/location/:when', (req, res) => {
  const {when} = req.params;
  const closestTime = getClosestTime(exampleData, when);
  res.send(closestTime);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

var bluebird = require('bluebird');
var redis = require('redis');
var redisClient = bluebird.promisifyAll(redis.createClient());
var NUMBER_OF_REQUESTS = 2000;

redisClient.on('error', function(err) {
  console.log(`Error: ${err}`);
});

var callCounter = 0;

function getInMemoryCounter() {
  callCounter++;
  return callCounter;
}

function getRedisCounter() {
  var startTime = new Date().getTime();
  return redisClient.incrAsync('callCounter')
  .then(function(callCounter) {
    var endTime = new Date().getTime();
    return {
      callCounter: callCounter,
      totalTime: endTime - startTime
    }
  });
}

function testInMemoryRetrieval() {
  var startTime = new Date().getTime();
  for (var i = 0; i < NUMBER_OF_REQUESTS; i++) {
    var temporaryStore = getInMemoryCounter();
  }
  var endTime = new Date().getTime();
  var totalTime = endTime - startTime;
  console.log(`Total time for in memory is ${totalTime} ms`);
}

function testRedisRetrieval() {
  redisClient.setAsync('callCounter', 0)
  .then(function() {
    var startTime = new Date().getTime();
    var allRetrievals = [];
    for (var i = 0; i < NUMBER_OF_REQUESTS; i++) {
      allRetrievals.push(getRedisCounter());
    }
    return Promise.all(allRetrievals)
    .then(function(results) {
      var endTime = new Date().getTime();
      var totalTime = endTime - startTime;
      var averageTotal = 0;
      for (var i = 0; i < results.length; i++) {
        averageTotal += results[i].totalTime;
      }
      console.log(`Average time for redis is ${averageTotal / NUMBER_OF_REQUESTS} ms`);
      process.exit();
    });
  });
}

console.log(`Number of requests: ${NUMBER_OF_REQUESTS}`);
testRedisRetrieval();
testInMemoryRetrieval();

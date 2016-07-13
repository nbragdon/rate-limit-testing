var koa = require('koa');
var router = require('koa-router');
var bodyParser = require('koa-bodyparser');
var popsicle = require('popsicle');
var bluebird = require('bluebird');
var app = koa();
var NUMBER_OF_REQUESTS = 100;
var PORT = 3001;

var resourceCounter = 0;

function getResourceCounter() {
  resourceCounter++;
  return resourceCounter;
}

app.use(function* () {
  this.body = {
    counter: getResourceCounter(),
    startTime: new Date().getTime()
  };
  this.status = 200;
});

app.listen(PORT);

function testLocalHttpRequests() {
  var allGets = [];
  for (var i = 0; i < NUMBER_OF_REQUESTS; i++) {
    allGets.push(popsicle.get(`http://localhost:${PORT}`)
      .then(function(response) {
        var parsedBody = JSON.parse(response.body);
        var endTime = new Date().getTime();
        return endTime - parsedBody.startTime;
      })
    );
  }
  Promise.all(allGets)
  .then(function(values) {
    var totalCount = 0;
    for (var i = 0; i < values.length; i++) {
      totalCount += values[i];
    }
    console.log(`Average response time from server: ${totalCount / NUMBER_OF_REQUESTS} ms`);
    process.exit();
  });
}

function testLocalMemoryRequests() {
  var startTime = new Date().getTime();
  for (var i = 0; i < NUMBER_OF_REQUESTS; i++) {
    var temporaryStore = getResourceCounter();
  }
  var endTime = new Date().getTime();
  var timeDifference = endTime - startTime;
  console.log(`Total time for in memory is ${timeDifference} ms`);
}

console.log(`Number of requests: ${NUMBER_OF_REQUESTS}`);
testLocalHttpRequests();
testLocalMemoryRequests();

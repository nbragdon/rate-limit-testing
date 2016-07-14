var koa = require('koa');
var KoaSocket = require('koa-socket');
var app = koa();
var rateLimit = new KoaSocket({
  namespace: 'rateLimit'
});

var PORT = 3000;
var NUMBER_OF_REQUESTS = 2000;
var URL = `http://localhost:${PORT}`;
var REQUEST_EVENT = 'incomingRequest';
var COUNTER_INCREMENTED_EVENT = 'counterIncremented';

rateLimit.attach(app);

var resourceCounter = 0;

function getResourceCounter() {
  resourceCounter++;
  return resourceCounter;
}

app.rateLimit.on(REQUEST_EVENT, (ctx, data) => {
  var newCount = getResourceCounter();
  var endTime = new Date().getTime();
  app.rateLimit.broadcast(COUNTER_INCREMENTED_EVENT, {
    count: newCount,
    resource: data.resource,
    client: data.client,
    totalTime: endTime - data.startTime
  });
});

app.listen(PORT);

var clientSocket = require('socket.io-client')(`${URL}/rateLimit`);

clientSocket.on('connect', function() {
  for (var i = 0; i < NUMBER_OF_REQUESTS; i++) {
    clientSocket.emit(REQUEST_EVENT, {
      resource: '/v1/users/u1/calls',
      client: 'u1',
      startTime: new Date().getTime()
    });
  }
});

var requestsMade = 0;
var averageTotal = 0;
clientSocket.on(COUNTER_INCREMENTED_EVENT, function(data) {
  averageTotal += data.totalTime;
  requestsMade++;
  if (requestsMade === NUMBER_OF_REQUESTS) {
    console.log(`Average time for websocket is ${averageTotal / NUMBER_OF_REQUESTS} ms`);
    process.exit();
  }
});

clientSocket.on('disconnect', function() {
  console.log('client disconnected');
});

function testInMemoryRetrieval() {
  var startTime = new Date().getTime();
  for (var i = 0; i < NUMBER_OF_REQUESTS; i++) {
    var temporaryStore = getResourceCounter();
  }
  var endTime = new Date().getTime();
  var totalTime = endTime - startTime;
  console.log(`Total time for in memory is ${totalTime} ms`);
}

testInMemoryRetrieval();

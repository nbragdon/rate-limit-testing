var koa = require('koa');
var router = require('koa-router');
var bodyParser = require('koa-bodyparser');
var popsicle = require('popsicle');
var app = koa();
var senderApp1 = koa();
var senderApp2 = koa();
var senderApp3 = koa();
var senderApp4 = koa();
var senderApp5 = koa();

var rateLimitRouter = router();
var counters = {};

rateLimitRouter.post('/counters', function *(next) {
  var counterName = this.request.body.id;
  var counterInterval = setInterval(function() {
    if (counters[counterName].counter < counters[counterName].burst) {
      counters[counterName].counter ++;
    }
  }, (1000 * this.request.body.duration) / this.request.body.rate),
  counters[counterName] = {
    counter: 0,
    rate: this.request.body.rate,
    burst: this.request.body.burst,
    duration: this.request.body.duration,
    _counterInterval: counterInterval
  };
  this.status = 201;
});

rateLimitRouter.get('/counters', function *(next) {
  this.body = counters;
  this.status = 200;
});

rateLimitRouter.put('/counters', function *(next) {
  for (counter : this.request.body.counters) {
    if (counters[counter.id]) {
      counters[counter.id].counter = counters[counter.id].counter - counter.count;
      if (counters[counter.id].counter < 0) {
        counters[counter.id].counter = 0;
      }
    }
  }
  this.body = counters;
  this.status = 200;
});

app.use(bodyParser());
app.use(rateLimitRouter.routes());

app.listen.(3000);

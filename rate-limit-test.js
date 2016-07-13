var popsicle = require('popsicle');

for (var i = 0; i < 50; i++) {
  getPetId(1);
}

for (var i = 0; i < 4; i++) {
  setTimeout(function() {
    getPetId(2);
  }, 1000 * i);
}

function getPetId(id) {
  popsicle.get(`https://86xqrkbsf6.execute-api.us-east-1.amazonaws.com/test/pets/${id}/id`)
  .then(function(res) {
    if (res.status !== 200) {
      console.log(`Get Pet ${id} Id failed - got status ${res.status}`);
    } else {
      console.log(res.status);
    }
  })
  .catch(function(err) {
    console.log('failed', err);
  });
}

function getPetPrice(id) {
  popsicle.get(`https://86xqrkbsf6.execute-api.us-east-1.amazonaws.com/test/pets/${id}/price`)
  .then(function(res) {
    if (res.status !== 200) {
      console.log(`Get Pet ${id} Price failed - got status ${res.status}`);
    } else {
      console.log(res.status);
    }
  })
  .catch(function(err) {
    console.log('failed', err);
  });
}

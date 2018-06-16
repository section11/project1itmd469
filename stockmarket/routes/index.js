var express = require('express');
var router = express.Router();
var request = require('request-promise-native');
const key = process.env.STOCK_KEY;

var stockData = function(req, res, next){
  const options = {
    uri: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=${key}',
    headers:{
      'User-Agent': 'Request-Promise'
    }
  };
  request(options).then(function(data){
    //req.data = JSON.parse(data);
    req.data = data;
    next();
  });
}

router.use(stockData);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Stock Market Data', data: req.data });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var request = require('request-promise-native');
var csv = require('csv-parse');
var fs = require('fs');
const key = process.env.STOCK_KEY;

var readStockList = function(req, res, next){
  let stockList = [];
  var reader
  = fs.createReadStream('/home/csegarce/Documents/itmd469/project1/stockmarket/public/stocklist.csv')
      .pipe(csv({delimiter: ','}))
      .on('data', function(data){
        data.forEach(function(stock){
          stockList.push(stock);
        });
      })
      .on('end', function(){
        req.stockList = stockList;
        next();
      });
}

function requestStock(stockName) {
  let options = {
    uri: "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + stockName + "&interval=1min&apikey=${key}",
    headers:{
      'User-Agent': 'Request-Promise'
    }
  };
  return new Promise(function(resolve, reject) {
    request(options).then(function(data){
      return resolve(data);
    }).catch(function(err){
      return reject(err);
    });
  });
}

var stockData = function(req, res, next){
  requests = [];
  for(var index in req.stockList){
    let stockName =  req.stockList[index];
    requests.push(requestStock(stockName));
  }
  Promise.all(requests).then(function(stocksData){
    req.data = stocksData;
    next();
  }).catch(function(err){
    req.data = "Server error";
    next();
  });
}

router.use(readStockList);
router.use(stockData);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Stock Market Data', data: req.data });
});

module.exports = router;

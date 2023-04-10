const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const crypto = require('crypto');

const cors =  require('cors')
const app = express();

app.use(cors())

require("dotenv").config();

app.use(express.json()); 
app.use(bodyParser.json());


const MERCHANT_KEY = process.env.MERCHANT_KEY
const MERCHANT_SALT = process.env.MERCHANT_SALT
const PAYU_BASE_URL = 'https://secure.payu.in/_payment'


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('PayUmoney Payment Integration with Express.js');
});


app.post('/pay', (req, res) => {

  console.log(req.body)

  const { amount, productinfo, firstname, email, phone } = req.body;

  // console.log( amount, productinfo, firstname, email, phone)

  // Generate a transaction ID using the current timestamp
  const transactionId = Date.now().toString();

  // Generate a checksum hash for the payment request
  const hashString = `${MERCHANT_KEY}|${transactionId}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${MERCHANT_SALT}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  console.log("hash", hash)

  // Set up the payment request parameters
  const options = {
    method: 'POST',
    uri: PAYU_BASE_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      key: MERCHANT_KEY,
      txnid: transactionId,
      amount: amount,
      productinfo: productinfo,
      firstname: firstname,
      email: email,
      phone: phone,
      surl: 'https://payumoney-integration.up.railway.app/Paymentsuccess',
      furl: 'https://payumoney-integration.up.railway.app/Paymentfailure',
      hash: hash
    }
  };

  // Send the payment request to PayUmoney
  request(options, (error, response, body) => {
    if (error) {
      console.error(error);
      res.send(error);
    } else {
      // console.log("***************************************")
      // console.log(response)
      // console.log(response.caseless.dict.location)

      // res.send(response.caseless.dict.location)
      res.send(response.headers.location)
    }
  });
});

let jsonData = {};

app.post('/Paymentsuccess', (req, res) => {
  jsonData = req.body
  console.log(req);
  res.redirect("http://localhost:3000/Paymentsuccess");

});

app.get('/Paymentsuccess', (req, res) => {
  console.log(jsonData)
  res.send(jsonData);
})




app.post('/Paymentfailure', (req, res) => {

  console.log("*************************************************************")
  console.log("req", req);
  console.log("res", res)
  // res.send(req.query)
   
  jsonData = req.body
  console.log("jsonData", jsonData)

  res.redirect("http://localhost:3000/Paymentfailure");

});

app.get('/Paymentfailure', (req, res) => {
  // console.log("req", req, res)
  // console.log('Retrieving JSON data via GET:', jsonData);
  console.log(jsonData)
  res.send(jsonData);

})




app.listen(process.env.PORT, () => {
    
   try {
    console.log('Server started on port 3001');
   } catch (error) {
    console.log(error)
   }

  
});










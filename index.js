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
const PAYU_BASE_URL = process.env.PAYU_BASE_URL


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('PayUmoney Payment Integration with Express.js');
});


app.post('/payumoney', (req, res) => {

  // console.log(req.body)

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
      surl: 'http://localhost:3001/Paymentsuccess',
      furl: 'http://localhost:3001/Paymentfailure',
      hash: hash
    }
  };

  // Send the payment request to PayUmoney
  request(options, (error, response, body) => {
    if (error) {
      console.error(error);
      res.send('An error occurred');
    } else {
      // console.log("***************************************")
      // console.log(response.caseless.dict.location)

      res.send(response.caseless.dict.location)
    }
  });
});

app.post('/Paymentsuccess', (req, res) => {

  console.log(req);
  res.send(req.body);

});

app.get('/Paymentsuccess', (req, res) => {
    res.send(req)
})

let jsonData = {};


app.post('/Paymentfailure', (req, res) => {
  // console.log("*************************************************************")
  // console.log("req", req);
  // res.send(req.query)
   
  jsonData = req.body

  res.redirect("http://localhost:3000/Paymentfailure");
});

app.get('/Paymentfailure', (req, res) => {
  // console.log("req", req, res)
  // console.log('Retrieving JSON data via GET:', jsonData);
  res.send(jsonData);

})




app.post('/practice', (req, res) => {

  jsonData = req.body; // Store the JSON data in the `jsonData` variable
  console.log('Received JSON data via POST:', jsonData);
  res.send('Received JSON data successfully');

})

app.get('/practice', (req, res) => {

  console.log('Retrieving JSON data via GET:', jsonData);
  res.send(jsonData);

})

app.listen(process.env.PORT, () => {
    
   try {
    console.log('Server started on port 3001');
   } catch (error) {
    console.log(error)
   }

  
});










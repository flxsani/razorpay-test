const dotenv = require("dotenv").config();
const express = require('express');
const { CreateOrder, CreatePaymentLink, VerifyPayment } = require("./razorpay-utils");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Manage CORS 

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Callback-Type, Content-Type, Accept");
    res.header('Cache-Control', 'no-cache');
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
});


// Payment APIs

// It will be used to create the order.
app.post('/payment/create-order', async (req, res) => {

    // let orderData = {amount:1000, currency:'INR', internalRefNo:'REF1234'}
    console.log("Payload::", req.body);
    let orderData = { amount: req.body.amount, currency: req.body.currency, internalRefNo: req.body.internalRefNo }
    CreateOrder(orderData).then((order) => {
        console.log("OrderInApp.js::", order);
        res.send({ status: true, message: "Payment order success", order: order })
    }).catch((err) => {
        res.send({ status: false, message: "Payment order failed", error: err });
    });
})


app.post('/payment/create-payment-link', async (req, res) => {

    // console.log("Payload::", req.body);
    // let data = {
    //     "amount": 1000,
    //     "currency": "INR",
    //     "accept_partial": false,
    //     "first_min_partial_amount": 0,
    //     "expire_by": 1691097057,
    //     "reference_id": "REF1234",
    //     "description": "Payment for link testing #23456",
    //     "customer": {
    //         "name": "Sani Yadav",
    //         "contact": "+918299759269",
    //         "email": "sani@antino.io"
    //     },
    //     "notify": {
    //         "sms": true,
    //         "email": true
    //     },
    //     "reminder_enable": true,
    //     "notes": {
    //         "policy_name": "Jeevan Bima"
    //     },
    //     "callback_url": "http://localhost:4200/payment/webhooK/payment-link",
    //     "callback_method": "get"
    // }
    CreatePaymentLink(req.body).then((order) => {
        console.log("OrderInApp.js::", order);
        res.send({ status: true, message: "Payment order success", order: order })
    }).catch((err) => {
        res.send({ status: false, message: "Payment order failed", error: err });
    });
});


// It will be used to capture the create payment link response as hooks.
app.get('/payment/webhooK/payment-link', async (req, res) => {
    console.log("Response::", req.query);
    VerifyPayment(req.query).then((order) => {
        console.log("OrderInApp.js::", order);
        res.send({ status: true, message: "Payment order success", order: order })
    }).catch((err) => {
        res.send({ status: false, message: "Payment order failed", error: err });
    });

    /// Manage the logic to update the data in database here depending upon response  
    /// Verify the cot

})



app.listen(process.env.PORT, () => {
    console.log("Server started at port ", process.env.PORT);
})
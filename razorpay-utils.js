const { default: axios } = require('axios');
const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});


function CreateOrder(data) {
    let options = {
        amount: data.amount,  // amount in the smallest currency unit
        currency: data.currency,
        receipt: data.internalRefNo
    };
    return new Promise((resolve, reject) => {
        instance.orders.create(options, function (err, order) {
            console.log(err, order);
            if (err == null) {
                console.log("inSuccess::", order);
                resolve(order);
            }
            else {
                console.log("inError::", err);
                reject(err);
            }

        });
    })


}


function CreatePaymentLink(data) {
    return new Promise((resolve, reject) => {
        let url = 'https://api.razorpay.com/v1/payment_links';
        let b64Str = new Buffer(`${process.env.KEY_ID}:${process.env.KEY_SECRET}`).toString('base64');
        console.log("Base64:::", b64Str);
        axios({
            method: 'post',
            url: url,
            data: data,
            headers: { 'Authorization': `Basic ${b64Str}` }
        }).then((response) => {
            // console.log("Response::", response.data);
            resolve(response.data);
        }).catch((error) => {
            // console.log("APIError::", error)
            reject(error)
        })
    })


}

function VerifyPayment(data) {
    return new Promise((resolve, reject) => {

        let signature_payload = data.razorpay_payment_link_id + '|' + data.razorpay_payment_link_reference_id + '|' + data.razorpay_payment_link_status + '|' + data.razorpay_payment_id;

        var crypto = require("crypto");
        var expectedSignature = crypto.createHmac('sha256', process.env.KEY_SECRET)
            .update(signature_payload.toString())
            .digest('hex');
        console.log("sig received ", data.razorpay_signature);
        console.log("sig generated ", expectedSignature);
        var response = { "signatureIsValid": "false" }
        if (expectedSignature === data.razorpay_signature)
            response = { "signatureIsValid": "true" }

        resolve(response);
    })

}

module.exports = { CreateOrder, CreatePaymentLink, VerifyPayment };
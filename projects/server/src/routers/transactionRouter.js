const { transactionController } = require('../controllers');
const { readToken } = require('../helper/jwt');
const route = require('express').Router();
const uploader = require('../helper/uploader3');

route.post('/',
    readToken,
    transactionController.newTransaction)
route.get('/detail', readToken, transactionController.getTransactionTimeAndBank)
route.patch('/upload-image-payment/:uuid', readToken, uploader('/ImgPayment', 'PAY').array('images', 1), transactionController.uploadImagePayment)
route.patch('/status', readToken, transactionController.updateTransactionStatus)
route.patch('/reject', readToken, transactionController.rejectTransaction)
route.patch('/confirm', readToken, transactionController.confirmTransaction)


module.exports = route;
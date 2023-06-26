const model = require('../models');
const sequelize = require('sequelize');
const path = require('path');
const { v4: uuidv4 } = require("uuid");
const fs = require('fs')
const schedule = require('node-schedule');
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars")
const puppeteer = require("puppeteer")
const { join } = require("path");


module.exports = {
    newTransaction: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            // EXPIRED AT + 2 HOUR
            let twoHoursLater = new Date();
            twoHoursLater.setHours(twoHoursLater.getHours() + 2)

            const countDays = (start_date, end_date) => {
                const diff = new Date(end_date) - new Date(start_date)
                const days = (diff / 86400000);
                return days;
            };

            const formatDateIndo = (tanggal) => {
                return new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Asia/Jakarta' }).format(tanggal)
            }

            let transaksi = await model.transaction.create({
                uuid: uuidv4(),
                transaction_statusId: 1,
                userId: req.decrypt.id, // decrypt
                discount: 0,
                expiredAt: twoHoursLater.toISOString(),
                invoice_number: twoHoursLater.getTime()
            },
                { transaction: ormTransaction }
            );

            let addOrder = await model.order.create({
                uuid: uuidv4(),
                start_date: req.body.start,
                end_date: req.body.end,
                price: req.body.price,//
                transactionId: transaksi.dataValues.id,
                roomId: req.body.roomId
            },
                { transaction: ormTransaction }
            );

            await ormTransaction.commit();

            console.log("get addOrder", addOrder.dataValues.id);

            let get = await model.transaction.findOne({
                where: {
                    id: transaksi.dataValues.id
                },
                attributes: ['uuid'],
                include: [
                    {
                        model: model.order, attributes: ['start_date', 'end_date', 'price'],
                        include: [
                            {
                                model: model.room, attributes: ['uuid', 'propertyId'],
                                include: [
                                    { model: model.property, attributes: ['property'] }, // propertyName 
                                    { model: model.room_category, attributes: ['name'] }, // roomName
                                ]
                            },
                        ]
                    },
                    {
                        model: model.user, attributes: ['uuid'],
                        include: [
                            { model: model.user_detail, attributes: ['name'] }
                        ]
                    }
                ]
            });

            console.log("gettt dataa", get);


            let getTenant = await model.property.findOne({
                where: {
                    id: get.dataValues.orders[0].room.propertyId
                },
                attributes: ['property'],
                include: [
                    {
                        model: model.user, attributes: ['uuid'], include: [
                            { model: model.user_detail, attributes: ['name', 'account_number'] } // tenant bank
                        ]
                    }
                ]
            })

            console.log("getTenant", getTenant.dataValues.user.user_detail);


            let data = {
                customerName: get.dataValues.user.user_detail.name,
                expiredDate: formatDateIndo(twoHoursLater),
                propertyName: get.dataValues.orders[0].room.property.property,
                roomName: get.dataValues.orders[0].room.room_category.name,
                checkIn: req.body.start,
                totalDays: countDays(req.body.start, req.body.end),
                tenantName: getTenant.dataValues.user.user_detail.name,
                tenantNorek: getTenant.dataValues.user.user_detail.dataValues.account_number,
                totalPrice: countDays(req.body.start, req.body.end) * get.dataValues.orders[0].price,
            }

            console.log("data keisi", data);

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
                    pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
                },
            });
            transporter.use(
                "compile",
                hbs({
                    viewEngine: {
                        extname: ".html", // html extension
                        layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                        defaultLayout: "payment-guidelines", // name of main template
                        partialsDir: join(__dirname, "../helper"), // location of your subtemplates aka. header, footer etc
                    },
                    viewPath: join(__dirname, "../helper"),
                    extName: ".html",
                })
            );
            //3. send verification email
            await transporter.sendMail({
                from: "Tracker admin",
                to: req.body.email,
                subject: "Payment Guidelines for Your Booking",
                template: "payment-guidelines",
                context: data,
                priority: 'high'
            });



            // NODE-SCHEDULE
            const task = schedule.scheduleJob(twoHoursLater, async function () {
                let get = await model.transaction.findAll({
                    attributes: ['transaction_statusId'],
                    where: { id: transaksi.dataValues.id }
                });
                console.log("getttt : ", get)
                if (get[0].dataValues.transaction_statusId === 1) { // setelah 2 jam ga upload
                    let update = await model.transaction.update({
                        transaction_statusId: 5
                    }, {
                        where: {
                            id: transaksi.dataValues.id
                        }
                    });
                    transporter.use(
                        "compile",
                        hbs({
                            viewEngine: {
                                extname: ".html", // html extension
                                layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                                defaultLayout: "cancel-payment", // name of main template
                                partialsDir: join(__dirname, "../helper"), // location of your subtemplates aka. header, footer etc
                            },
                            viewPath: join(__dirname, "../helper"),
                            extName: ".html",
                        })
                    );
                    //3. send verification email
                    await transporter.sendMail({
                        from: "Tracker admin",
                        to: req.body.email,
                        subject: "Your order has been cancelled",
                        template: "cancel-payment",
                        context: data,
                        priority: 'high'
                    });
                    console.log("transaction status di ubah ke canceled karena tidak membayar")
                }
            });

            res.status(200).send({
                success: true,
                data1: transaksi,
                data2: addOrder
            })

        } catch (error) {
            await ormTransaction.rollback();
            console.log(error);
            next(error);
        }
    },
    getTransactionTimeAndBank: async (req, res, next) => {
        try {
            let getTransactionTime = await model.transaction.findAll({
                attributes: ['createdAt', 'transaction_statusId', "invoice_number", "expiredAt"],
                where: {
                    uuid: req.query.uuid
                },
                include: [
                    {
                        model: model.order, attributes: ['start_date', 'end_date', 'price'],
                        include: [{
                            model: model.room, attributes: ['uuid', 'room_categoryId'],
                            include: [
                                {
                                    model: model.room_category, attributes: ['user_id', 'name']
                                }
                            ]
                        }]
                    },
                    {
                        model: model.transaction_status, attributes: ['status']
                    },
                    {
                        model: model.user, attributes: ['uuid'],
                        include: [{
                            model: model.user_detail, attributes: ['name'] // user
                        }]
                    }
                ]
            });
            let getBank = await model.user.findAll({
                include: [{ model: model.user_detail, attributes: ['name', 'account_number'] }], //  tenant
                attributes: ['uuid'],
                where: {
                    id: getTransactionTime[0].orders[0].room.room_category.user_id
                }
            })
            res.status(200).send({
                success: true,
                timeAndPrice: getTransactionTime,
                bank: getBank
            })
        } catch (error) {
            console.log(error);
            next(error);
        }

    },
    uploadImagePayment: async (req, res, next) => {
        try {
            let get = await model.transaction.findAll({ // get untuk di pakai di fs
                attributes: ['image_payment'],
                where: {
                    uuid: req.params.uuid
                }
            });
            console.log("get transs", get)
            console.log("req.files", req.files);
            let update = await model.transaction.update({
                image_payment: `/ImgPayment/${req.files[0].filename}`,
                transaction_statusId: 2
            }, {
                where: {
                    uuid: req.params.uuid
                }
            });
            if (fs.existsSync(join(__dirname, `../public${get[0].dataValues.image_payment}`))) {
                fs.unlinkSync(join(__dirname, `../public${get[0].dataValues.image_payment}`));
            }
            res.status(200).send({
                success: true,
                message: 'Image Uploaded',
                // data: update
            })
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    updateTransactionStatus: async (req, res, next) => {
        try {
            //CANCEL PAYMENT

            let update = await model.transaction.update({
                transaction_statusId: req.body.transaction_statusId
            }, {
                where: {
                    uuid: req.body.uuid
                }
            });

            const countDays = (start_date, end_date) => {
                const diff = new Date(end_date) - new Date(start_date)
                const days = (diff / 86400000);
                return days;
            };

            let get = await model.transaction.findOne({
                where: {
                    uuid: req.body.uuid
                },
                attributes: ['uuid'],
                include: [
                    {
                        model: model.order, attributes: ['start_date', 'end_date', 'price'],
                        include: [
                            {
                                model: model.room, attributes: ['uuid', 'propertyId'],
                                include: [
                                    { model: model.property, attributes: ['property'] }, // propertyName 
                                    { model: model.room_category, attributes: ['name'] }, // roomName
                                ]
                            },
                        ]
                    },
                    {
                        model: model.user, attributes: ['email'],
                        include: [
                            { model: model.user_detail, attributes: ['name'] }
                        ]
                    }
                ]
            });

            let data = {
                customerName: get.dataValues.user.user_detail.name,
                propertyName: get.dataValues.orders[0].room.property.property,
                roomName: get.dataValues.orders[0].room.room_category.name,
                checkIn: get.dataValues.orders[0].start_date,
                totalDays: countDays(get.dataValues.orders[0].start_date, get.dataValues.orders[0].end_date),
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
                    pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
                },
            });
            transporter.use(
                "compile",
                hbs({
                    viewEngine: {
                        extname: ".html", // html extension
                        layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                        defaultLayout: "cancel-payment", // name of main template
                        partialsDir: join(__dirname, "../helper"), // location of your subtemplates aka. header, footer etc
                    },
                    viewPath: join(__dirname, "../helper"),
                    extName: ".html",
                })
            );
            //3. send verification email
            await transporter.sendMail({
                from: "Tracker admin",
                to: get.dataValues.user.email,
                subject: "Your order has been cancelled",
                template: "cancel-payment",
                context: data,
                priority: 'high'
            });


            res.status(200).send({
                success: true,
                message: "transaction status updated"
            })
        } catch (error) {
            console.log(error);
            next(error);
        }

    },
    rejectTransaction: async (req, res, next) => {
        try {
            const twoHoursLater = new Date();
            twoHoursLater.setHours(twoHoursLater.getHours() + 2);

            const formatDateIndo = (tanggal) => {
                return new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Asia/Jakarta' }).format(tanggal)
            }

            let update = await model.transaction.update({
                transaction_statusId: 4,
                expiredAt: twoHoursLater
            }, {
                where: {
                    uuid: req.body.uuid
                }
            });

            let get = await model.transaction.findOne({
                where: {
                    uuid: req.body.uuid
                },
                attributes: ['uuid'],
                include: [
                    {
                        model: model.user, attributes: ['email'],
                        include: [
                            { model: model.user_detail, attributes: ['name'] }
                        ]
                    }
                ]
            });

            let data = {
                customerName: get.dataValues.user.user_detail.name,
                expiredDate: formatDateIndo(twoHoursLater),
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
                    pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
                },
            });


            transporter.use(
                "compile",
                hbs({
                    viewEngine: {
                        extname: ".html", // html extension
                        layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                        defaultLayout: "reject-payment", // name of main template
                        partialsDir: join(__dirname, "../helper"), // location of your subtemplates aka. header, footer etc
                    },
                    viewPath: join(__dirname, "../helper"),
                    extName: ".html",
                })
            );

            await transporter.sendMail({
                from: "Tracker admin",
                to: get.dataValues.user.email,
                subject: "Your order has been rejected",
                template: "reject-payment",
                context: data,
                priority: 'high'
            });

            console.log("email terkirim");

            const task = schedule.scheduleJob(twoHoursLater, async function () {
                let get = await model.transaction.findAll({
                    attributes: ['transaction_statusId'],
                    where: { uuid: req.body.uuid }
                });
                console.log("getttt : ", get)
                if (get[0].dataValues.transaction_statusId === 4) { // setelah 2 jam ga bayar
                    let update = await model.transaction.update({
                        transaction_statusId: 5
                    }, {
                        where: {
                            uuid: req.body.uuid
                        }
                    });
                    transporter.use(
                        "compile",
                        hbs({
                            viewEngine: {
                                extname: ".html", // html extension
                                layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                                defaultLayout: "cancel-payment", // name of main template
                                partialsDir: join(__dirname, "../helper"), // location of your subtemplates aka. header, footer etc
                            },
                            viewPath: join(__dirname, "../helper"),
                            extName: ".html",
                        })
                    );
                    //3. send verification email
                    await transporter.sendMail({
                        from: "Tracker admin",
                        to: get.dataValues.user.email,
                        subject: "Your order has been cancelled",
                        template: "cancel-payment",
                        context: data,
                        priority: 'high'
                    });
                    console.log("transaction status di ubah ke canceled karena tidak membayar")
                }
            });
            res.status(200).send({
                success: true
            })
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    confirmTransaction: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            const countDays = (start_date, end_date) => {
                const diff = new Date(end_date) - new Date(start_date)
                const days = (diff / 86400000);
                return days;
            };

            const formatRupiah = (money) => {
                return new Intl.NumberFormat('id-ID',
                    { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }
                ).format(money);
            }

            let get = await model.transaction.findOne({
                where: {
                    uuid: req.body.uuid
                },
                attributes: ['uuid', 'invoice_number', 'updatedAt', 'expiredAt'],
                include: [
                    {
                        model: model.order, attributes: ['start_date', 'end_date', 'price'],
                        include: [
                            {
                                model: model.room, attributes: ['uuid', 'propertyId'],
                                include: [
                                    { model: model.property, attributes: ['property'] }, // propertyName 
                                    { model: model.room_category, attributes: ['name'] }, // roomName
                                ]
                            },
                        ]
                    },
                    {
                        model: model.user, attributes: ['email'],
                        include: [
                            { model: model.user_detail, attributes: ['name'] }
                        ]
                    }
                ]
            });

            let getTenant = await model.property.findOne({
                where: {
                    id: get.dataValues.orders[0].room.propertyId
                },
                attributes: ['property'],
                include: [
                    {
                        model: model.user, attributes: ['uuid'], include: [
                            { model: model.user_detail, attributes: ['name', 'account_number'] } // tenant bank
                        ]
                    }
                ]
            })

            let data = {
                customerName: get.dataValues.user.user_detail.name,
                invoiceNumber: get.dataValues.invoice_number,
                transactionDate: get.dataValues.updatedAt,
                propertyName: get.dataValues.orders[0].room.property.property,
                roomName: get.dataValues.orders[0].room.room_category.name,
                checkIn: get.dataValues.orders[0].start_date,
                checkOut: get.dataValues.orders[0].end_date,
                totalDays: countDays(get.dataValues.orders[0].start_date, get.dataValues.orders[0].end_date),
                totalPrice: formatRupiah(countDays(get.dataValues.orders[0].start_date, get.dataValues.orders[0].end_date) * get.dataValues.orders[0].price),
                tenantName: getTenant.dataValues.user.user_detail.name,
                tenantNorek: getTenant.dataValues.user.user_detail.dataValues.account_number,
                expiredDate: get.dataValues.expiredAt,
            }



            // CREATE PDF
            const templateHtmlToPdf = fs.readFileSync(
                path.join(__dirname, "../helper/invoice.html"),
                "utf8"
            );
            const template = handlebars.compile(templateHtmlToPdf);
            const finalHtmlToPdf = encodeURIComponent(template(data));
            const destinationPath = path.join(
                __dirname,
                "../public/GeneratePdf",
                `${get.dataValues.invoice_number}-${get.dataValues.user.user_detail.name}.pdf`
            );
            const options = {
                format: "A4",
                headerTemplate: "<p></p>",
                footerTemplate: "<p></p>",
                displayHeaderFooter: false,
                margin: {
                    top: "40px",
                    bottom: "100px",
                },
                printBackground: true,
                path: destinationPath,
            };
            const browser = await puppeteer.launch({
                args: ["--no-sandbox"],
                headless: 'new',
            });
            const page = await browser.newPage();
            await page.goto(`data:text/html;charset=UTF-8,${finalHtmlToPdf}`, {
                waitUntil: "networkidle0",
            });
            await page.pdf(options);
            await browser.close();

            // CREATE EMAIL
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.NODEMAILER_TRANSPORTER_USERNAME,
                    pass: process.env.NODEMAILER_TRANSPORTER_PASSWORD,
                },
            });
            transporter.use(
                "compile",
                hbs({
                    viewEngine: {
                        extname: ".html", // html extension
                        layoutsDir: join(__dirname, "../helper"), // location of handlebars templates
                        defaultLayout: "email-voucer", // name of main template
                        partialsDir: join(__dirname, "../helper"), // location of your subtemplates aka. header, footer etc
                    },
                    viewPath: join(__dirname, "../helper"),
                    extName: ".html",
                })
            );

            // SEND EMAIL
            await transporter.sendMail({
                from: "Tracker admin",
                to: get.dataValues.user.email,
                subject: "Your Voucher is Ready to Download",
                template: "email-voucer",
                context: data,
                attachments: [
                    {
                        path: destinationPath,
                    },
                ],
                priority: 'high'
            });

            console.log("Send Pdf Success");

            // UPDATE DATABASE
            let update = await model.transaction.update({
                transaction_statusId: 3,
            }, {
                where: {
                    uuid: req.body.uuid
                }
            }, { transaction: ormTransaction }
            );

            await ormTransaction.commit();
            res.status(200).send('Success confirm transaction');
        } catch (error) {
            await ormTransaction.rollback();
            console.log(error);
            next(error);
        }

    },
}
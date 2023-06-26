const schedule = require('node-schedule');
const model = require("../models");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { join } = require("path");

module.exports = {
    reminderCheckInUser: () => {
        schedule.scheduleJob('0 4 * * *', async () => { // everyday at 11.00AM (4AM UTC === 11AM Jakarta)
            const today = new Date();
            const nextDay = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];


            let orders = await model.order.findAll({
                attributes: ['start_date', 'end_date', 'price'],
                where: {
                    start_date: nextDay
                },
                include: [
                    {
                        model: model.transaction, attributes: ['invoice_number'], // invoice number
                        include: [
                            {
                                model: model.user, attributes: ['email'], // email customer
                                include: [
                                    { model: model.user_detail, attributes: ['name'] } // customer name
                                ]
                            }
                        ]
                    },
                    {
                        model: model.room, attributes: ['uuid'],
                        include: [
                            { model: model.room_category, attributes: ['name'] }, // room name
                            { model: model.property, attributes: ['property'] } // property name
                        ]
                    }
                ]
            })


            console.log('running a task', nextDay);
            console.log(orders);

            if (orders.length) {
                console.log('ada data');
                for (const [index, order] of orders.entries()) {
                    const diff = new Date(order.dataValues.end_date) - new Date(order.dataValues.start_date)
                    const days = (diff / 86400000);

                    const emailUser = order.dataValues.transaction.user.email


                    let data = {
                        customerName: order.dataValues.transaction.user.user_detail.name,
                        propertyName: order.dataValues.room.property.property,
                        checkIn: order.dataValues.start_date,
                        checkOut: order.dataValues.end_date,
                        invoiceNumber: order.dataValues.transaction.invoice_number,
                        roomName: order.dataValues.room.room_category.name,
                        totalDays: days,
                        totalPrice: order.dataValues.price * days,
                    }
                    console.log("datttaaa", data)

                    const transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: `${process.env.NODEMAILER_TRANSPORTER_USERNAME}`,
                            pass: `${process.env.NODEMAILER_TRANSPORTER_PASSWORD}`,
                        },
                    });
                    transporter.use(
                        "compile",
                        hbs({
                            viewEngine: {
                                extname: ".html", // html extension
                                layoutsDir: __dirname, // location of handlebars templates
                                defaultLayout: "checkin-reminder", // name of main template
                                partialsDir: __dirname, // location of your subtemplates aka. header, footer etc
                            },
                            viewPath: __dirname,
                            extName: ".html",
                        })
                    );
                    //3. send verification email
                    await transporter.sendMail({
                        from: "Tracker admin",
                        to: emailUser,
                        subject: "Check-In Reminder",
                        template: "checkin-reminder",
                        context: data,
                    });

                    console.log(`Email ke ${index + 1}`);
                }
            } else {
                console.log('gak ada data');
            }

        });
    }

}
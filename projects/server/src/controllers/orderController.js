const sequelize = require("sequelize");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");
const schedule = require('node-schedule');

module.exports = {
    getAllOrder: async (req, res, next) => {
        try {
            let get = await model.order.findAndCountAll({
                offset: parseInt(((req.query.page || 1) - 1) * (req.query.size || 5)),
                limit: parseInt(req.query.size || 1),
                where: {
                    start_date: {
                        [sequelize.Op.gte]: req.query.start || '2000-01-01', // filter by date
                    },
                    end_date: {
                        [sequelize.Op.lte]: req.query.end || '2030-01-01', // filter by date
                    }
                },
                include: [
                    {
                        model: model.transaction,
                        attributes: ['id', 'transaction_statusId', 'invoice_number', 'uuid'],
                        required: true,
                        where: {
                            transaction_statusId: { [sequelize.Op.like]: `%${req.query.status}%` }, // filter by transaction_status
                            userId: req.decrypt.id,
                            invoice_number: { [sequelize.Op.like]: `%${req.query.invoice}%` } // filter by invoice number
                        },
                        include: [
                            {
                                model: model.transaction_status, attributes: ['status']
                            },
                            {
                                model: model.review, attributes: ['review', 'rating']
                            }
                        ]
                    },
                    {
                        model: model.room, attributes: ['id', 'capacity'],
                        include: [
                            {
                                model: model.room_category, attributes: ['name']
                            },
                            {
                                model: model.property, attributes: ['property']
                            },
                            {
                                model: model.picture_room, attributes: ['picture'], limit: 1
                            },
                        ]
                    }
                ],
                order: [[req.query.sortby || 'id', req.query.order || 'DESC']] // order by date or order id
            });
            res.status(200).send({
                data: get,
                datanum: get.count
            })
        } catch (error) {
            console.log(error);
            next(error);
        }

    },
    getActionsNeededTenant: async (req, res, next) => {
        try {
            let get = await model.order.findAndCountAll({
                offset: parseInt(((req.query.page || 1) - 1) * (req.query.size || 5)),
                limit: parseInt(req.query.size || 1),
                include: [
                    {
                        model: model.transaction, required: true, where: { transaction_statusId: 2 },
                        include: [
                            {
                                model: model.user,
                                include: [{ model: model.user_detail }]
                            }
                        ]
                    },
                    {
                        model: model.room, required: true,
                        include: [
                            {
                                model: model.property, where: { userId: req.decrypt.id }, // req.decrypt.id
                                include: [
                                    {
                                        model: model.property_location, attributes: ['country'],
                                        include: [{ model: model.regency, attributes: ['name'] }]
                                    }
                                ]
                            },
                            {
                                model: model.room_category, attributes: ['name']
                            }
                        ]
                    }
                ],
                order: [[req.query.sortby || 'id', req.query.order || 'desc']]
            });
            res.status(200).send(get)
        } catch (error) {
            console.log(error);
            next(error);
        }

    },
    getSummary: async (req, res, next) => {
        try {
            let get = await model.order.findAndCountAll({
                offset: parseInt(((req.query.page || 1) - 1) * (req.query.size || 2)),
                limit: parseInt(req.query.size || 2),
                include: [
                    {
                        model: model.transaction, required: true, // invoice number
                        include: [
                            { model: model.transaction_status, attributes: ['status'] }, // transaction_status
                            { model: model.user, attributes: ['uuid'], include: [{ model: model.user_detail, attributes: ['name'] }] },

                        ]
                    },
                    {
                        model: model.room, attributes: ['uuid'], required: true,
                        include: [
                            { model: model.room_category, attributes: ['name'] }, // room name
                            { model: model.property, attributes: ['property'], where: { userId: req.decrypt.id } } // req.decrypt.id, property name
                        ]
                    },
                ],
                order: [[req.query.sortby || 'id', req.query.order || 'desc']]
            })
            res.status(200).send(get)
        } catch (error) {
            console.log(error);
            next(error);
        }

    },
}
const sequelize = require("sequelize");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");

module.exports = {
    getAllOrder: async (req, res, next) => {
        let get = await model.order.findAndCountAll({
            // offset: parseInt(req.query.page || 0 * req.query.size || 3 + 1),
            offset: parseInt(((req.query.page || 1) - 1) * (req.query.size || 3)),
            limit: parseInt(req.query.size || 3),
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
                    attributes: ['transaction_statusId', 'invoice_number', 'uuid'],
                    where: {
                        transaction_statusId: { [sequelize.Op.like]: `%${req.query.status}%` }, // filter by transaction_status
                        userId: req.decrypt.id, //////////// req.decrypt.id
                        invoice_number: { [sequelize.Op.like]: `%${req.query.invoice}%` } // filter by invoice number
                    },
                    include: [
                        {
                            model: model.transaction_status, attributes: ['status']
                        }
                    ]
                },
                {
                    model: model.room, attributes: ['capacity'],
                    include: [
                        {
                            model: model.room_category, attributes: ['name']
                        },
                        {
                            model: model.property, attributes: ['property']
                        },
                        {
                            model: model.picture_room, attributes: ['picture']
                        }
                    ]
                }
            ],
            order: [[req.query.sortby || 'start_date', req.query.order || 'DESC']] // order by date or order id
        });
        console.log("data paginationnn", get.rows);
        res.status(200).send({
            data: get,
            datanum: get.count
        })
    }
}
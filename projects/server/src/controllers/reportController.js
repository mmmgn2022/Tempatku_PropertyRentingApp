const model = require("../models");
const sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const con = require("../helper/dbCon");

module.exports = {
    getIncomeToday: async (req, res, next) => {
        try {
            const { start, end } = req.query;

            let get = await model.order.sum("order.price", {
                where: {
                    createdAt: {
                        [sequelize.Op.gte]: start,
                        [sequelize.Op.lte]: end,
                    },
                },
                include: [
                    {
                        model: model.transaction,
                        required: true,
                        where: {
                            transaction_statusId: 3,
                        },
                    },
                    {
                        model: model.room,
                        required: true,
                        include: [
                            {
                                model: model.property,
                                where: {
                                    userId: req.decrypt.id,
                                },
                            },
                        ],
                    },
                ],
            });
            console.log(get);

            res.status(200).send({
                success: true,
                income: get,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    transactionChart: async (req, res, next) => {
        try {
            const { start, end } = req.query;

            let endDate = new Date().toISOString().split("T")[0];
            let tempDate = new Date() - 604800000;
            let sevenDaysAgo = new Date(tempDate).toISOString().split("T")[0];
            const options = {
                year: "2-digit",
                month: "2-digit",
                day: "numeric",
            };

            let dateArr = [];
            let totalArr = [];

            let chart = await model.order.findAll({
                attributes: [
                    [
                        sequelize.fn("sum", sequelize.col("order.price")),
                        "totalPrice",
                    ],
                    "createdAt",
                ],

                where: {
                    createdAt: {
                        [sequelize.Op.gte]: start,
                        [sequelize.Op.lte]: end,
                    },
                },

                include: [
                    {
                        model: model.transaction,
                        required: true,
                        where: {
                            transaction_statusId: 3,
                        },
                    },
                    {
                        model: model.room,
                        required: true,
                        include: [
                            {
                                model: model.property,
                                where: {
                                    userId: req.decrypt.id,
                                },
                            },
                        ],
                    },
                ],
                group: ["createdAt"],
                order: [["createdAt", "ASC"]],
            });

            for (let i = 0; i < chart.length; i++) {
                dateArr.push(
                    new Date(chart[i].createdAt).toLocaleDateString(
                        "en-EN",
                        options
                    )
                );
                totalArr.push(chart[i].dataValues.totalPrice);
            }

            res.status(200).send({
                success: true,
                data: {
                    date: dateArr,
                    total: totalArr,
                },
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    propertyChart: async (req, res, next) => {
        try {
            const { idProperty } = req.params;

            const { start, end } = req.query;

            let endDate = new Date().toISOString().split("T")[0];
            let tempDate = new Date() - 604800000;
            let sevenDaysAgo = new Date(tempDate).toISOString().split("T")[0];
            const options = {
                year: "2-digit",
                month: "2-digit",
                day: "numeric",
            };

            let dateArr = [];
            let totalArr = [];

            let chart = await model.order.findAll({
                attributes: [
                    [
                        sequelize.fn("sum", sequelize.col("order.price")),
                        "totalPrice",
                    ],
                    "createdAt",
                ],
                where: {
                    createdAt: {
                        [sequelize.Op.gte]: start,
                        [sequelize.Op.lte]: end,
                    },
                },
                include: [
                    {
                        model: model.transaction,
                        where: {
                            transaction_statusId: 3,
                        },
                    },
                    {
                        model: model.room,
                        attributes: ["propertyId"],
                        where: {
                            propertyId: idProperty,
                        },
                        include: [
                            {
                                model: model.property,
                                where: {
                                    userId: req.decrypt.id,
                                },
                            },
                        ],
                    },
                ],
                group: ["createdAt"],
                order: [["createdAt", "ASC"]],
            });

            for (let i = 0; i < chart.length; i++) {
                dateArr.push(
                    new Date(chart[i].createdAt).toLocaleDateString(
                        "en-EN",
                        options
                    )
                );
                totalArr.push(chart[i].dataValues.totalPrice);
            }

            res.status(200).send({
                success: true,
                data: {
                    date: dateArr,
                    total: totalArr,
                },
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getUserPerDay: async (req, res, next) => {
        try {
            const { start, end } = req.query;

            const query = `SELECT o.createdAt, o.roomId, r.capacity, SUM(r.capacity) AS countRooms
            FROM orders o
            JOIN rooms r ON o.roomId = r.id
            WHERE o.createdAt BETWEEN '${start}' AND '${end}'
            GROUP BY o.roomId;`;

            const total_users = await con.query(query, {
                type: sequelize.QueryTypes.SELECT,
            });

            res.status(200).send({
                success: true,
                data: total_users,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    userChart: async (req, res, next) => {
        try {
            const { start, end } = req.query;

            endDate = new Date().toISOString().split("T")[0];
            let tempDate = new Date() - 604800000;
            let sevenDaysAgo = new Date(tempDate).toISOString().split("T")[0];

            let dateArr = [];
            let totalArr = [];

            let chart = await model.order.findAll({
                attributes: [
                    "createdAt",
                    [
                        sequelize.fn("SUM", sequelize.col("room.capacity")),
                        "totalUsers",
                    ],
                ],
                where: {
                    createdAt: {
                        [sequelize.Op.gte]: start,
                        [sequelize.Op.lte]: end,
                    },
                },
                include: [
                    {
                        model: model.room,
                        attributes: ["id", "capacity"],
                        include: [
                            {
                                model: model.property,
                                where: {
                                    userId: req.decrypt.id,
                                },
                            },
                        ],
                    },
                ],
            });

            const options = {
                year: "2-digit",
                month: "2-digit",
                day: "numeric",
            };

            for (let i = 0; i < chart.length; i++) {
                dateArr.push(
                    new Date(chart[i].createdAt).toLocaleDateString(
                        "en-EN",
                        options
                    )
                );
                totalArr.push(chart[i].dataValues.totalUsers);
            }

            res.status(200).send({
                success: true,
                data: {
                    date: dateArr,
                    total: totalArr,
                },
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
};

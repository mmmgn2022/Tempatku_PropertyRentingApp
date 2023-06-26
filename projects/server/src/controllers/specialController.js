const model = require("../models");
const sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

module.exports = {
    getRoomData: async (req, res, next) => {
        try {
            let get = await model.room.findOne({
                where: {
                    uuid: req.params.uuid,
                },
                attributes: ["price", "id"],
            });
            res.status(200).send({
                success: true,
                data: get,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    createSpecialPrice: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            let existingSpecialPrices = await model.special_price.findAll({
                where: {
                    roomId: req.body.roomId,
                },
            });

            const overlappingSpecialPrice = existingSpecialPrices.find(
                (specialPrice) => {
                    const startDate = new Date(req.body.specialStartDate);
                    const endDate = new Date(req.body.specialEndDate);
                    const existingStartDate = new Date(specialPrice.startDate);
                    const existingEndDate = new Date(specialPrice.endDate);

                    return (
                        (startDate >= existingStartDate &&
                            startDate <= existingEndDate) ||
                        (endDate >= existingStartDate &&
                            endDate <= existingEndDate)
                    );
                }
            );

            if (overlappingSpecialPrice) {
                return res.status(400).send({
                    success: false,
                    message:
                        "Invalid dates. Overlapping special price already exists.",
                });
            } else {
                let addSpecial = await model.special_price.create(
                    {
                        uuid: uuidv4(),
                        startDate: req.body.specialStartDate,
                        endDate: req.body.specialEndDate,
                        priceOnDate: req.body.price,
                        roomId: req.body.roomId,
                    },
                    { transaction: ormTransaction }
                );

                await ormTransaction.commit();

                res.status(200).send({
                    success: true,
                    message: "Special Price created",
                    data: addSpecial,
                });
            }
        } catch (error) {
            await ormTransaction.rollback();
            console.log(error);
            next(error);
        }
    },
    listSpecialPrice: async (req, res, next) => {
        try {
            let { page, size, sortby, order } = req.query;
            if (!page) {
                page = 0;
            }
            if (!size) {
                size = 5;
            }
            if (!sortby) {
                sortby = "id";
            }
            if (!order) {
                order = "DESC";
            }

            let getRoomId = await model.room.findOne({
                where: {
                    uuid: req.params.uuid,
                },
            });

            let count = await model.special_price.findAll({
                where: {
                    roomId: getRoomId.id,
                    isDeleted: 0,
                },
            });

            let get = await model.special_price.findAndCountAll({
                offset: parseInt(page * size),
                limit: parseInt(size),
                include: [
                    {
                        model: model.room,
                        where: {
                            isDeleted: 0,
                        },
                        include: [
                            {
                                model: model.room_category,
                            },
                        ],
                    },
                ],
                where: {
                    roomId: getRoomId.id,
                    isDeleted: 0,
                },
                order: [[sortby, order]],
            });

            res.status(200).send({
                data: get.rows,
                totalPages: Math.ceil(get.count / size),
                datanum: count.length,
                // success: true,
                // data: getRoomId,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    deleteSpecialPrice: async (req, res, next) => {
        try {
            let get = await model.special_price.findAll({
                where: {
                    uuid: req.body.uuid,
                },
            });
            let del = await model.special_price.update(
                {
                    isDeleted: true,
                    isActive: false,
                },
                {
                    where: {
                        uuid: req.body.uuid,
                    },
                }
            );
            res.status(200).send({
                success: true,
                message: "Special Price Deleted",
                data: get,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    editIsActiveSpecial: async (req, res, next) => {
        try {
            let get = await model.special_price.findOne({
                where: {
                    uuid: req.params.uuid,
                },
            });

            if (get.dataValues.isActive === true) {
                await model.special_price.update(
                    {
                        isActive: false,
                    },
                    {
                        where: {
                            uuid: get.dataValues.uuid,
                        },
                    }
                );
            } else {
                await model.special_price.update(
                    {
                        isActive: true,
                    },
                    {
                        where: {
                            uuid: get.dataValues.uuid,
                        },
                    }
                );
            }
            res.status(200).send({
                success: true,
                data: get,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
};

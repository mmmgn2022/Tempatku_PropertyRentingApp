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
                attributes: ["id"],
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
    createMaintenance: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            let existingMaintenance = await model.maintenance.findAll({
                where: {
                    roomId: req.body.roomId,
                },
            });

            const overlappingMaintenance = existingMaintenance.find(
                (maintenance) => {
                    const startDate = new Date(req.body.maintenanceStartDate);
                    const endDate = new Date(req.body.maintenanceEndDate);
                    const existingStartDate = new Date(maintenance.startDate);
                    const existingEndDate = new Date(maintenance.endDate);

                    return (
                        (startDate >= existingStartDate &&
                            startDate <= existingEndDate) ||
                        (endDate >= existingStartDate &&
                            endDate <= existingEndDate)
                    );
                }
            );

            if (overlappingMaintenance) {
                return res.status(400).send({
                    success: false,
                    message:
                        "Invalid dates. Overlapping maintenance already exists.",
                });
            } else {
                let addMaintenance = await model.maintenance.create(
                    {
                        uuid: uuidv4(),
                        startDate: req.body.maintenanceStartDate,
                        endDate: req.body.maintenanceEndDate,
                        remarks: req.body.remarks,
                        roomId: req.body.roomId,
                    },
                    { transaction: ormTransaction }
                );

                await ormTransaction.commit();

                res.status(200).send({
                    success: true,
                    message: "Mainentenace Price created",
                    data: addMaintenance,
                });
            }
        } catch (error) {
            await ormTransaction.rollback();
            console.log(error);
            next(error);
        }
    },
    listMaintenance: async (req, res, next) => {
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

            let count = await model.maintenance.findAll({
                where: {
                    roomId: getRoomId.id,
                    isDeleted: 0,
                },
            });

            let get = await model.maintenance.findAndCountAll({
                offset: parseInt(page * size),
                limit: parseInt(size),
                include: [
                    {
                        model: model.room,
                        where: {
                            isDeleted: 0,
                        },
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
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    deleteMaintenance: async (req, res, next) => {
        try {
            let del = await model.maintenance.update(
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
                data: del,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    editIsActiveMaintenance: async (req, res, next) => {
        try {
            let get = await model.maintenance.findOne({
                where: {
                    uuid: req.params.uuid,
                },
            });
            if (get.dataValues.isActive === true) {
                await model.maintenance.update(
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
                await model.maintenance.update(
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
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
};

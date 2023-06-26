const sequelize = require("sequelize");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createToken } = require("../helper/jwt");
const fs = require("fs");
const { join } = require("path");

module.exports = {
    getPropertyNameAndIdByUserId: async (req, res, next) => {
        try {
            let get = await model.property.findAll({
                where: {
                    userId: req.decrypt.id,
                    isDeleted: false,
                },
                attributes: [
                    ["id", "value"],
                    ["property", "label"],
                ],
            });
            return res.status(200).send(get);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getDetailRoomTransaction: async (req, res, next) => {
        try {
            let get = await model.room.findAll({
                where: {
                    uuid: req.query.uuid,
                },
                include: [
                    {
                        model: model.property,
                        include: [
                            {
                                model: model.property_location,
                                attributes: ["country", "address"],
                                include: [
                                    {
                                        model: model.regency,
                                        attributes: ["name"],
                                    },
                                ],
                            },
                        ],
                    },
                    { model: model.room_category },
                    { model: model.picture_room },
                ],
            });
            res.status(200).send(get);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    addRoom: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            let { price, description, capacity, propertyId, name } = JSON.parse(
                req.body.data
            );

            let addRoomCategory = await model.room_category.create(
                {
                    name,
                    user_id: req.decrypt.id,
                },
                { transaction: ormTransaction }
            );

            let addRoom = await model.room.create(
                {
                    uuid: uuidv4(),
                    price,
                    description,
                    capacity,
                    propertyId,
                    room_categoryId: addRoomCategory.dataValues.id,
                },
                { transaction: ormTransaction }
            );
            if (req.files.length) {
                let newArr = req.files.map((val, idx) => {
                    delete val.fieldname;
                    delete val.originalname;
                    delete val.encoding;
                    delete val.mimetype;
                    delete val.destination;
                    delete val.path;
                    delete val.size;
                    val.picture = `/ImgRoom/${val.filename}`;
                    delete val.filename;
                    return { ...val, roomId: addRoom.dataValues.id };
                });
                await model.picture_room.bulkCreate(newArr);
            }

            await ormTransaction.commit();
            return res.status(200).send({
                success: true,
                data: addRoom,
            });
        } catch (error) {
            await ormTransaction.rollback();

            console.log(error);
            next(error);
        }
    },
    getRoomData: async (req, res, next) => {
        try {
            let get = await model.room.findAll({
                where: { uuid: req.params.uuid },
                include: [
                    {
                        model: model.room_category,
                        attributes: ["name"],
                    },
                    {
                        model: model.picture_room,
                        attributes: ["picture", "id"],
                        required: false,
                        where: {
                            isDeleted: 0,
                        },
                    },
                ],
            });
            return res.status(200).send({
                success: true,
                data: get,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    editRoom: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            let editRoomDetails = await model.room.update(
                {
                    price: req.body.price,
                    description: req.body.description,
                    capacity: req.body.capacity,
                },
                {
                    where: {
                        uuid: req.params.uuid,
                    },
                },
                { transaction: ormTransaction }
            );
            let getRoomByUuid = await model.room.findAll({
                where: {
                    uuid: req.params.uuid,
                },
                include: [{ model: model.room_category, attributes: ["id"] }],
            });

            let editRoomName = await model.room_category.update(
                {
                    name: req.body.name,
                },
                {
                    where: {
                        id: getRoomByUuid[0].dataValues.room_category.id,
                    },
                },
                { transaction: ormTransaction }
            );

            await ormTransaction.commit();

            res.status(200).send({
                success: true,
                message: "Room Data Updated.",
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    updateImageRoom: async (req, res, next) => {
        try {
            if (!isNaN(req.query.id)) {
                let get = await model.picture_room.findAll({
                    where: {
                        id: req.query.id,
                    },
                });

                let update = await model.picture_room.update(
                    {
                        picture: `/ImgRoom/${req.files[0].filename}`,
                    },
                    {
                        where: {
                            id: req.query.id,
                        },
                    }
                );
                if (
                    fs.existsSync(
                        join(__dirname, `../public${get[0].dataValues.picture}`)
                    )
                ) {
                    fs.unlinkSync(
                        join(__dirname, `../public${get[0].dataValues.picture}`)
                    );
                }
            } else {
                let add = await model.picture_room.create({
                    roomId: req.query.roomId,
                    picture: `/ImgRoom/${req.files[0].filename}`,
                });
            }
            res.status(200).send({
                success: true,
                message: "Image uploaded",
            });
        } catch (error) {
            next(error);
        }
    },
    deleteRoomPicture: async (req, res, next) => {
        try {
            let get = await model.picture_room.findAll({
                where: {
                    id: req.query.id,
                },
            });
            let del = await model.picture_room.destroy({
                where: {
                    id: req.query.id,
                },
            });
            if (
                fs.existsSync(
                    join(__dirname, `../public${get[0].dataValues.picture}`)
                )
            ) {
                fs.unlinkSync(
                    join(__dirname, `../public${get[0].dataValues.picture}`)
                );
            }
            res.status(200).send({
                success: true,
                message: "Image Deleted",
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    // Pagination
    listRoom: async (req, res, next) => {
        try {
            let { page, size, sortby, order } = req.query;
            if (!page) {
                page = 0;
            }
            if (!size) {
                size = 10;
            }
            if (!sortby) {
                sortby = "name";
            }
            if (!order) {
                order = "ASC";
            }

            let get = await model.room.findAndCountAll({
                offset: parseInt(page * size),
                limit: parseInt(size),
                where: {
                    isDeleted: 0,
                },
                include: [
                    {
                        model: model.room_category,
                        order: [[model.room_category, sortby, order]],
                    },
                    {
                        model: model.property,
                        where: {
                            uuid: req.query.uuid,
                        },
                    },
                ],
            });
            return res.status(200).send({
                data: get.rows,
                totalPages: Math.ceil(get.count / size),
                datanum: get.count,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    deleteRoom: async (req, res, next) => {
        try {
            let del = await model.room.update(
                {
                    isDeleted: true,
                },
                {
                    where: {
                        uuid: req.params.uuid,
                    },
                }
            );
            res.status(200).send({
                success: true,
                message: "Room Deleted",
                data: del,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
};

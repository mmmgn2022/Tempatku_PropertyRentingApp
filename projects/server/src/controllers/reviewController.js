const sequelize = require("sequelize");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");


module.exports = {
    getAverageAndReviewProperty: async (req, res, next) => {
        try {
            let get = await model.review.findAll({
                include: [
                    {
                        model: model.room, attributes: ['description'], required: true,
                        include: [
                            { model: model.room_category, attributes: ['name'] },
                            { model: model.property, attributes: ['property'], where: { userId: 9 } }, //uuid
                        ]
                    },
                    {
                        model: model.user, attributes: ['uuid'],
                        include: [
                            { model: model.user_detail, attributes: ['name', 'image_profile'] }
                        ]
                    }
                ]
            });
            let getAvg = await model.review.findAll({
                attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
                include: [
                    {
                        model: model.room, attributes: ['uuid'], required: true,
                        include: [{
                            model: model.property, attributes: ['property'], where: {
                                id: 2 // pake uuid harusnya
                            }
                        }]
                    }
                ]
            })
            res.status(200).send({
                review: get,
                average: getAvg
            })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    addReview: async (req, res, next) => {
        try {
            let add = await model.review.create({
                uuid: uuidv4(),
                review: req.body.review,
                rating: req.body.rating,
                roomId: req.body.roomId,
                userId: req.decrypt.id, // decrypt.id
                transactionId: req.body.transactionId
            })

            res.status(200).send({
                success: true,
                message: 'Review added'
            })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    getAllReview: async (req, res, next) => {
        try {
            let getReview = await model.review.findAll({
                attributes: ['review', 'rating', 'createdAt'],
                include: [
                    {
                        model: model.room, attributes: ['id'], required: true,
                        include: [
                            {
                                model: model.property, attributes: ['property'],
                                where: {
                                    uuid: req.query.uuid
                                }
                            }
                        ]
                    },
                    {
                        model: model.user, attributes: ['uuid'],
                        include: [
                            { model: model.user_detail, attributes: ['name', 'image_profile'] }
                        ]
                    }
                ]
            })
            res.send(getReview)
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getAverage: async (req, res, next) => {
        try {
            let getAvg = await model.review.findOne({
                attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
                include: [
                    {
                        model: model.room, attributes: ['uuid'], required: true,
                        include: [{
                            model: model.property, attributes: ['property'], where: {
                                uuid: req.query.uuid // pake uuid harusnya
                            }
                        }]
                    }
                ]
            })
            console.log("average", getAvg.dataValues);
            res.status(200).send(getAvg)
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    countReview: async (req, res, next) => {
        try {
            let get = await model.review.findAll({
                attributes: [[sequelize.fn('COUNT', sequelize.col('review')), 'review']],
                include: [
                    {
                        model: model.room, attributes: ['uuid'],
                        include: [
                            {
                                model: model.property, attributes: ['property'],
                                where: {
                                    uuid: req.query.uuid
                                }
                            }
                        ]
                    }
                ]
            })
        } catch (error) {
            console.log(error);
            next(error);
        }
    }

}

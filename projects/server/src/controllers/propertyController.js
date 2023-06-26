const sequelize = require("sequelize");
const model = require("../models");
const { v4: uuidv4 } = require("uuid");
const con = require("../helper/dbCon");
const fs = require("fs");
const { join } = require("path");


module.exports = {
    getAllProperty: async (req, res, next) => {
        try {
            let get = await model.property.findAll({
                include: [
                    { model: model.picture_property },
                    {
                        model: model.property_location,
                        include: [{ model: model.province }],
                    },
                    {
                        model: model.room,
                        order: [["price", "DESC"]], // belom kelar msh tunggu dri mas abdi
                    },
                ],
            });
            console.log("resss", get);
            res.status(200).send(get);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    filterProperty: async (req, res, next) => {
        try {
            console.log("req.query", req.query);
            let {
                page,
                size,
                name,
                sortby,
                order,
                category,
                city,
                start,
                end,
            } = req.query;
            if (!page) {
                page = 0;
            }
            if (!size) {
                size = 6;
            }
            if (!sortby) {
                sortby = "property";
            }
            if (!order) {
                order = "ASC";
            }

            if (!start) {
                start = new Date().toISOString().split("T")[0];
            }

            if (!end) {
                end = new Date();
                let oneDayInMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds
                end = new Date(end.getTime() + oneDayInMs)
                    .toISOString()
                    .split("T")[0];
                console.log("endd", end);
            }

            let get = await model.property.findAndCountAll({
                distinct: true,
                where: { property: { [sequelize.Op.like]: `%${name}%` } },
                include: [
                    {
                        model: model.room,
                        attributes: ["id", "price"],
                        required: true,
                        order: [[model.room, "price", "asc"]],
                    },
                    {
                        model: model.picture_property,
                        required: true,
                        attributes: ["picture"],
                    },
                    {
                        model: model.category,
                        required: true,
                        attributes: ["category"],
                        where: {
                            category: { [sequelize.Op.like]: `%${category}%` },
                        },
                    },
                    {
                        model: model.property_location,
                        required: true,
                        include: [
                            {
                                model: model.province,
                                required: true,
                                where: {
                                    name: { [sequelize.Op.like]: `%${city}%` },
                                },
                            },
                        ],
                    },
                ],
                order:
                    sortby == "property"
                        ? [[sortby, order]]
                        : [[model.room, sortby, order]],
            });

            const query = `
            Select r.*, o.start_date, o.end_date, t.transaction_statusId FROM rooms r left join orders o on r.id=o.roomId 
            left join transactions t on o.transactionId = t.id WHERE start_date is null OR start_date < '${start}' OR start_date > '${end}' OR end_date < '${start}' OR end_date > '${end}' OR t.transaction_statusId = 5 order by r.propertyId;`;

            const getAvailable = await con.query(query, {
                type: sequelize.QueryTypes.SELECT,
            });
            let newData = [];
            let plainObj = get.rows.map((e) => e.get({ plain: true })); // merubah object sequelize to plain object javascript
            plainObj.forEach((val, i) => {
                let temp = [];
                val.rooms.forEach((valData, idx) => {
                    let check = getAvailable.filter((e) => {
                        return valData.id == e.id;
                    });
                    if (check.length) {
                        temp.push(check[0]);
                    }
                });
                if (temp.length) {
                    newData.push({
                        ...val,
                        rooms: temp,
                    });
                }
            });

            // let filterData =  newData.slice((page - 1) * size, page * size )
            let filterData = newData.slice(page * size, page * size + size);
            console.log("filter DATAA", filterData);

            return res.status(200).send({
                data: filterData,
                datanum: newData.length,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getRoomAvailable: async (req, res, next) => {
        try {
            if (!req.query.start) {
                req.query.start = new Date().toISOString().split("T")[0];
            }

            if (!req.query.end) {
                req.query.end = new Date();
                let oneDayInMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds
                req.query.end = new Date(req.query.end.getTime() + oneDayInMs)
                    .toISOString()
                    .split("T")[0];
                console.log("endd", req.query.end);
            }

            let getPropertyId = await model.property.findAll({
                where: {
                    uuid: req.query.uuid,
                },
            });

            const start = req.query.start || "";
            const end = req.query.end || "";

            let get = await model.room.findAll({
                where: {
                    propertyId: getPropertyId[0].dataValues.id,
                    isDeleted: 0,
                    [sequelize.Op.and]: [
                        {
                            id: {
                                [sequelize.Op.notIn]: [
                                    sequelize.literal(`(
                                        SELECT roomId FROM orders join transactions on orders.transactionId = transactions.id WHERE 
                                        ((start_date >= '${req.query.start}' AND start_date <= '${req.query.end}')
                                        OR 
                                        (end_date >= '${req.query.start}' AND end_date <= '${req.query.end}')
                                        ) 
                                        AND transactions.transaction_statusId IN (1,2,3,4)) 
                                        `),
                                ],
                            },
                        },
                        {
                            id: {
                                [sequelize.Op.notIn]: [
                                    sequelize.literal(`
                                    SELECT roomId FROM maintenances WHERE 
                                    (maintenances.startDate >= '${req.query.start}' and maintenances.startDate <= '${req.query.end}') 
                                    or 
                                    (maintenances.endDate >= '${req.query.start}' and maintenances.endDate <= '${req.query.end}') 
                                        `),
                                ],
                            },
                        },
                    ],
                },
                include: [
                    { model: model.room_category, attributes: ["name"] },
                    { model: model.picture_room, attributes: ["picture"], where: { isDeleted: false } },
                ],
            });

            const query = `
                SELECT s.id, s.startDate, s.endDate, s.priceOnDate, s.isActive, s.roomId ,r.propertyId FROM special_prices s join rooms r
                on s.roomId = r.id 
                WHERE :start >= startDate 
                AND (
                    (startDate >= :start and startDate <= :end) 
                    or 
                    (endDate >= :start and endDate <= :end)
                )
                AND 
                isActive = 1
                ;
            `;

            const special_prices = await con.query(query, {
                replacements: { start: start, end: end },
                type: sequelize.QueryTypes.SELECT,
            });

            const final = get.map((val1) => {
                let special_price = special_prices.find(
                    (val2) => val2.roomId === val1.dataValues.id
                );
                if (special_price) {
                    return {
                        ...val1.dataValues,
                        price: special_price.priceOnDate,
                    };
                } else {
                    return val1;
                }
            });

            console.log("get room available", final);

            final.sort((a, b) => a.price - b.price)

            res.status(200).send(final);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getPropertyData: async (req, res, next) => {
        try {
            let get = await model.property.findAll({
                where: { uuid: req.params.uuid },
                include: [
                    {
                        model: model.category,
                        attributes: ["category"],
                    },
                    {
                        model: model.picture_property,
                        attributes: ["picture", "id"],
                        required: false,
                        where: {
                            isDeleted: 0,
                        },
                    },
                    {
                        model: model.property_location,
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
    getAllPropertyTenant: async (req, res, next) => {
        try {
            let get = await model.property.findAll({
                include: [
                    {
                        model: model.property_location,
                        attributes: ["address"],
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
    getProvince: async (req, res, next) => {
        try {
            let get = await model.province.findAll({
                attributes: [
                    ["id", "value"],
                    ["name", "label"],
                ],
            });
            return res.status(200).send(get);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getRegencyByProvinceId: async (req, res, next) => {
        try {
            let get = await model.regency.findAll({
                where: {
                    province_id: req.body.province_id,
                },
                attributes: [
                    ["id", "value"],
                    ["name", "label"],
                    ["province_id", "province_id"],
                ],
            });
            return res.status(200).send(get);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    addProperty: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            let {
                category,
                property,
                description,
                address,
                regencyId,
                provinceId,
                zipcode,
                country,
                gmaps,
            } = JSON.parse(req.body.data);

            let addCategory = await model.category.create(
                {
                    uuid: uuidv4(),
                    category: category,
                },
                { transaction: ormTransaction }
            );

            let addProperty = await model.property.create(
                {
                    uuid: uuidv4(),
                    property,
                    description,
                    categoryId: addCategory.dataValues.id,
                    userId: req.decrypt.id,
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
                    val.picture = `/ImgProperty/${val.filename}`;
                    delete val.filename;
                    return { ...val, propertyId: addProperty.dataValues.id };
                });
                await model.picture_property.bulkCreate(newArr);
            }

            let addPropertyLocation = await model.property_location.create(
                {
                    uuid: uuidv4(),
                    address: address,
                    zip: zipcode,
                    country: country,
                    gmaps: gmaps,
                    regency_id: regencyId,
                    provinceId: provinceId,
                    propertyId: addProperty.dataValues.id,
                },
                { transaction: ormTransaction }
            );

            await ormTransaction.commit();

            return res.status(200).send({
                success: true,
                message: "Added new property",
            });
        } catch (error) {
            await ormTransaction.rollback();
            console.log(error);
            next(error);
        }
    },
    getPropertyDetail: async (req, res, next) => {
        try {
            let get = await model.property.findAll({
                include: [
                    {
                        model: model.room,
                        attributes: ["id", "price", "uuid"],
                    },
                    {
                        model: model.property_location,
                        include: [{ model: model.regency }],
                    },
                    {
                        model: model.picture_property,
                    },
                    {
                        model: model.user,
                        include: [
                            {
                                model: model.user_detail,
                                attributes: ["name", "image_profile"],
                            },
                        ],
                    },
                ],
                order: [[model.room, "price", "asc"]],
                where: {
                    uuid: req.query.uuid,
                },
            });

            const start = req.query.start || "";
            const end = req.query.end || "";
            const uuid = req.query.uuid;

            const query = `
                SELECT s.id, s.startDate, s.endDate, s.priceOnDate, s.isActive, s.roomId ,r.propertyId FROM special_prices s join rooms r
                on s.roomId = r.id 
                join properties p on r.propertyId = p.id
                WHERE :start >= startDate 
                AND (
                    (startDate >= :start and startDate <= :end) 
                    or 
                    (endDate >= :start and endDate <= :end)
                )
                AND s.isActive = 1
                AND p.uuid = :uuid
                ;
            `;

            const special_prices = await con.query(query, {
                replacements: { start: start, end: end, uuid: uuid },
                type: sequelize.QueryTypes.SELECT,
            });
            console.log("sssss", get[0].dataValues.rooms);

            if (special_prices.length) {
                let newRoomPrice = get[0].dataValues.rooms.map((val, idx) => {
                    let special_price = special_prices.find((val2) => {
                        return val2.roomId === val.dataValues.id;
                    });
                    val.dataValues = {
                        ...val.dataValues, price: special_price ? special_price.priceOnDate : val.dataValues.price,
                    };
                    return val;
                });
                newRoomPrice = newRoomPrice.sort((a, b) => a.price - b.price);
                return res
                    .status(200)
                    .send({ ...get[0].dataValues, rooms: newRoomPrice });
            } else {
                get[0].dataValues.rooms.sort(
                    (a, b) => a.dataValues.price - b.dataValues.price
                );
                res.status(200).send(get[0]);
            }
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getSpecialPrice: async (req, res, next) => {
        try {
            let get = await model.special_price.findAll({
                where: { isActive: 1 },
                include: [
                    {
                        model: model.room,
                        attributes: ["id", "uuid", "price"],
                        where: {
                            uuid: req.params.uuid,
                        },
                    },
                ],
            });
            console.log("ini isi get :", get);
            console.log("ini isi params :", req.params.uuid);
            res.status(200).send(get);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    editProperty: async (req, res, next) => {
        const ormTransaction = await model.sequelize.transaction();
        try {
            let getPropertyByUuid = await model.property.findAll({
                where: {
                    uuid: req.params.uuid,
                },
                include: [
                    { model: model.property_location, attributes: ["id"] },
                    { model: model.category, attributes: ["id"] },
                ],
            });

            let editCategory = await model.category.update(
                {
                    category: req.body.category,
                },
                {
                    where: {
                        id: getPropertyByUuid[0].dataValues.categoryId,
                    },
                },
                { transaction: ormTransaction }
            );

            let editProperty = await model.property.update(
                {
                    property: req.body.property,
                    description: req.body.description,
                },
                {
                    where: {
                        uuid: getPropertyByUuid[0].dataValues.uuid,
                    },
                },
                { transaction: ormTransaction }
            );

            let editPropertyLocation = await model.property_location.update(
                {
                    address: req.body.address,
                    zip: req.body.zipcode,
                    country: req.body.country,
                    regencyId: req.body.regencyId,
                    provinceId: parseInt(req.body.provinceId),
                    gmaps: req.body.gmaps,
                },
                {
                    where: {
                        id: getPropertyByUuid[0].dataValues.property_location
                            .id,
                    },
                },
                { transaction: ormTransaction }
            );

            await ormTransaction.commit();

            return res.status(200).send({
                success: true,
                message: "Added new property",
            });
        } catch (error) {
            await ormTransaction.rollback();
            console.log(error);
            next(error);
        }
    },
    updateImageProperty: async (req, res, next) => {
        try {
            if (!isNaN(req.query.id)) {
                let get = await model.picture_property.findAll({
                    where: {
                        id: req.query.id,
                    },
                });
                let update = await model.picture_property.update(
                    {
                        picture: `/ImgProperty/${req.files[0].filename}`,
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
                let add = await model.picture_property.create({
                    propertyId: req.query.propertyId,
                    picture: `/ImgProperty/${req.files[0].filename}`,
                });
            }
            res.status(200).send({
                success: true,
                message: "Image Updated/Uploaded",
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    deletePropertyPicture: async (req, res, next) => {
        try {
            let get = await model.picture_property.findAll({
                where: {
                    id: req.query.id,
                },
            });
            let del = await model.picture_property.destroy({
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
    listProperty: async (req, res, next) => {
        try {
            let { page, size, sortby, order } = req.query;
            if (!page) {
                page = 0;
            }
            if (!size) {
                size = 8;
            }
            if (!sortby) {
                sortby = "property";
            }
            if (!order) {
                order = "ASC";
            }

            let getUserUuid = await model.user.findAll({
                attributes: ["id"],
                where: {
                    id: req.decrypt.id,
                },
            });

            let get = await model.property.findAndCountAll({
                offset: parseInt(page * size),
                limit: parseInt(size),
                where: {
                    property: {
                        [sequelize.Op.like]: `%${req.query.property}%`,
                    },
                    isDeleted: false,
                    userId: getUserUuid[0].dataValues.id,
                },
                include: [
                    {
                        model: model.property_location,
                        attributes: ["address"],
                    },
                ],
                order: [[sortby, order]],
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
    deleteProperty: async (req, res, next) => {
        try {
            let del = await model.property.update(
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
                message: "Property Deleted",
                data: del,
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getPicturePropertyDetail: async (req, res, next) => {
        try {
            let getProperty = await model.property.findAll({
                where: {
                    uuid: req.query.uuid,
                },
            });
            let getPictureProperty = await model.picture_property.findAll({
                where: {
                    propertyId: getProperty[0].dataValues.id,
                    isDeleted: false
                },
            });

            res.status(200).send(getPictureProperty);
            console.log("getPictureProperty", getPictureProperty);
        } catch (error) {
            console.log(error);
            next(error);
        }
    },
    getAvailableProperty: async (req, res, next) => {
        try {
            let name = req.query.name || "";
            let start = req.query.start;
            let end = req.query.end;
            let capacity = req.query.capacity || "";
            let category = req.query.category || "";
            let sortby = req.query.sortby || "property";
            let order = req.query.order || "DESC";
            let city = req.query.city || "";
            let limit = parseInt(parseInt(req.query.size) || 3);
            let offset = parseInt(
                ((parseInt(req.query.page) || 1) - 1) *
                (parseInt(req.query.size) || 3)
            );

            // Available Property
            const query1 = `select properties.id, 
        properties.uuid as uuid,
        properties.property as property_name ,
        min(rooms.price) as property_price, 
        picture_properties.picture, 
        provinces.name as province_name, 
        regencies.name as regency_name,
        property_locations.country as country,
        avg(reviews.rating) as rating,
        count(*) OVER() AS total_data
        from properties
        join rooms on properties.id = rooms.propertyId
        join categories on properties.categoryId = categories.id
        left join reviews on rooms.id = reviews.roomId
        left join maintenances on rooms.id = maintenances.roomId -- maintenance
        join picture_properties on properties.id = picture_properties.propertyId
        join property_locations on properties.id = property_locations.propertyId
        join provinces on property_locations.provinceId = provinces.id
        join regencies on property_locations.regency_id = regencies.id
        where properties.property like '%${name}%' and properties.id in (
            select distinct propertyId from rooms where rooms.id not in (
                select roomId from orders join transactions 
                on orders.transactionId = transactions.id 
                where 
                transactions.transaction_statusId IN (1,2,3,4)
                and (
                (start_date >= :start and start_date <= :end) 
                or 
                (end_date >= :start and end_date <= :end))
            ) AND rooms.id not in (
                SELECT roomId FROM maintenances WHERE (
                (startDate >= :start and startDate <= :end) 
                or 
                (endDate >= :start and endDate <= :end)
                ) AND maintenances.isActive = true AND maintenances.isDeleted = false
            ) AND properties.isDeleted = 0 AND rooms.capacity >= '${capacity}'
        ) AND rooms.isDeleted = 0 AND categories.category LIKE '%${category}%' AND provinces.name LIKE '%${city}%'
        group by properties.id, properties.property, provinces.name,
        regencies.name
        order by properties.property ${order} 
        limit ${limit} offset ${offset}
        ;`;

            // Special Price
            const query2 = `
        SELECT s.id, s.startDate, s.endDate, s.priceOnDate, s.isActive, r.propertyId FROM special_prices s join rooms r
        on s.roomId = r.id 
        WHERE  :start >= startDate 
        AND (
            (startDate >= :start and startDate <= :end) 
            or 
            (endDate >= :start and endDate <= :end)
        )
        AND isActive = 1
        ;`;

            // Total Data (count)
            const query3 = `select 
        count(*) OVER() AS total_data
        from properties
        join rooms on properties.id = rooms.propertyId
        left join reviews on rooms.id = reviews.roomId
        join categories on properties.categoryId = categories.id
        left join maintenances on rooms.id = maintenances.roomId -- maintenance
        join picture_properties on properties.id = picture_properties.propertyId
        join property_locations on properties.id = property_locations.propertyId
        join provinces on property_locations.provinceId = provinces.id
        join regencies on property_locations.regency_id = regencies.id
        where properties.property like '%${name}%' and properties.id in (
            select distinct propertyId from rooms where rooms.id not in (
                select roomId from orders join transactions 
                on orders.transactionId = transactions.id 
                where 
                transactions.transaction_statusId IN (1,2,3,4)
                and (
                (start_date >= :start and start_date <= :end) 
                or 
                (end_date >= :start and end_date <= :end))
            ) AND rooms.id not in (
                SELECT roomId FROM maintenances WHERE (
                    (startDate >= :start and startDate <= :end) 
                    or 
                    (endDate >= :start and endDate <= :end)
                    ) AND maintenances.isActive = true AND maintenances.isDeleted = false 
            ) AND properties.isDeleted = 0 AND rooms.capacity >= '${capacity}'
        ) AND categories.category LIKE '%${category}%' AND provinces.name LIKE '%${city}%'
        group by properties.id, properties.property, provinces.name, 
        regencies.name 
        ;`;

            // property min price jika ada maintenance
            const query4 = `
        select min(price) as price, propertyId from rooms where rooms.id not in (
            select roomId from maintenances where isActive = true and (
            (startDate >= :start and startDate <= :end) 
            or 
            (endDate >= :start and endDate <= :end)
            )
        ) group by propertyId;`

            const property = await con.query(query1, {
                replacements: { start: start, end: end, capacity: capacity },
                type: sequelize.QueryTypes.SELECT,
            });

            const special_prices = await con.query(query2, {
                replacements: { start: start, end: end },
                type: sequelize.QueryTypes.SELECT,
            });

            const total_data = await con.query(query3, {
                replacements: { start: start, end: end, capacity: capacity },
                type: sequelize.QueryTypes.SELECT,
            });

            const property_price = await con.query(query4, {
                replacements: { start: start, end: end },
                type: sequelize.QueryTypes.SELECT,
            });
            console.log("property", property);

            // function sort by
            const sortbyFunc = (result) => {
                if (sortby === "price" && order === "ASC") {
                    return result.sort(
                        (a, b) => a.property_price - b.property_price
                    );
                } else if (sortby === "price" && order === "DESC") {
                    return result.sort(
                        (a, b) => b.property_price - a.property_price
                    );
                } else {
                    return result;
                }
            };

            const property_available = property.map((val, idx) => {
                let price = property_price.find((val2) => val2.propertyId === val.id)
                if (price) {
                    return { ...val, property_price: price.price };
                } else {
                    return val;
                }
            })

            if (special_prices.length) {
                const final_result = property_available.map((val1) => {
                    let special_price = special_prices.find(
                        (val2) => val2.propertyId === val1.id
                    );
                    if (special_price) {
                        return {
                            ...val1,
                            property_price: special_price.priceOnDate,
                        };
                    } else {
                        return val1;
                    }
                });
                console.log("final result", final_result);
                res.status(200).send({
                    success: true,
                    data: sortbyFunc(final_result),
                    total_data: total_data.length,
                });
            } else {
                console.log("final result", property_available);
                res.status(200).send({
                    success: true,
                    data: sortbyFunc(property_available),
                    total_data: total_data.length,
                });
            }
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
};

const jwt = require('jsonwebtoken');

module.exports = {
    createToken: (payload, exp='24h') => jwt.sign(payload, process.env.JWT_SECRET_TOKEN, {
        expiresIn: exp
    }),
    readToken: (req, res, next) => {
        jwt.verify(req.token, process.env.JWT_SECRET_TOKEN, (error, decrypt) => {
            if(error){ 
                console.log(error);
                return res.status(401).send({
                    success: false,
                    message: 'AUTHENTICATION FAILED ❌'
                })
            }
            req.decrypt = decrypt; 
            next(); 
        })
    },
    createTokenForKTP: (payload) => jwt.sign(payload, process.env.JWT_SECRET_TOKEN),
}
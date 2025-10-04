const userModel = require('../model/user.mode');
const jwt = require('jsonwebtoken');

const authUser = async (req,res,next) => {

    const {token} = req.cookies

    if(!token) {
        return res.status(401).json({
            message:"Unauthorized"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(
            decoded.id
        )
        // .select('-password')

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({
            message:"Unauthorized"
        })
    }

}

module.exports = {
    authUser
}
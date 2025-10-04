const userModel = require('../model/user.mode')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req,res) => {

    const { fullName: {firstName, lastName}, email, password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
        email
    })

    if(isUserAlreadyExist) {
        return res.status(400).json({
            message:"username already exist, please login"
        })
    }

    const user = await userModel.create ({
        fullName: {
            firstName, lastName
        },
        email,
        password: await bcrypt.hash(password, 10)
    })

    const token = jwt.sign({
        id:user._id
    }, process.env.JWT_SECRET)

    res.cookie('token', token)

    res.status(201).json({
        message:"Created Successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })

}

const loginUser = async (req,res) =>{

    const { email,password } = req.body;

    const user = await userModel.findOne({
        email
    })

    if(!user) {
        return res.status(401).json({
            message:"wrong username, please try again"
        })
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if(!isPassword) {
        return res.status(401).json({
            message:"wrong password, please try again"
        })
    }

    const token = jwt.sign({
        id:user._id
    }, process.env.JWT_SECRET)

    res.cookie('token', token);

    res.status(200).json({
        message:"LoggedIn",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })

}

module.exports = {
    registerUser,
    loginUser
}
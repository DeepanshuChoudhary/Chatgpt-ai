const mongoose = require('mongoose');

const connectDB = async () => {
    // await mongoose.connect(process.env.MONGOOSE_URL)
    //     .then(() => {
    //         console.log("Connected with MongoDB")
    //     })
    //     .catch((err) => {
    //         console.log("Error: ", err);
    //     })

    try {
        await mongoose.connect(process.env.MONGOOSE_URL)

        console.log("Connect to MongoDB")
    }
    catch (err) {
        console.log("Error: ", err)
    }
}

module.exports = connectDB
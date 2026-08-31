// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         await mongoose.connect('mongodb+srv://shashwat:hellorax@cluster0.zm8e9bt.mongodb.net/?appName=Cluster0');
//         console.log('MongoDB Connected Successfully');
//     } catch (err) {
//         console.error('MongoDB Connection Failed:', err.message);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
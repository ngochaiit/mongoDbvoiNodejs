const mongoose = require('mongoose');
const {Schema} = mongoose;// Ky thuat "destructuring" trong JS schema = mongoose.schema
const {ObjectId} = Schema;

const connectDatabase =  async () =>
{
    try{
        let uri = 'mongodb://hainn:123@127.0.0.1:27018/HairHeavenData'
        let options = {
            connectTimeoutMS: 1000,//ket noi trong 10 giay. neu that bai tra ve error
            useNewUrlParser: true,
            useCreateIndex: true, //tao cac index cho collections.
        }
        await mongoose.connect(uri, options)
        console.log('connect mongo succesfully');

    }
    catch(error){

        console.log(`cannot connect mongo. Error: ${error}`);

    }
}

connectDatabase();

module.exports = {
    mongoose
}
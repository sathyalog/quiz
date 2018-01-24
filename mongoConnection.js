const mongoose = require('mongoose');
const config = require('./config/index');

const mongoConnection = {
    connect: function () {

        mongoose.Promise = global.Promise;
        mongoose.connect(config.MONGO.MONGO_URL);
    
        let db = mongoose.connection;
        db.on('connected', function() {
            console.log('Mongoose is now connected to ', config.MONGO.MONGO_URL);
        });
    
        db.on('error', function(err) {
            console.error('Error in Mongoose connection: ', err);
        });
    
        db.on('disconnected', function() {
            console.log('Mongoose is now disconnected..!');
        });
    
        process.on('SIGINT', function() {
            db.close(function() {
                console.log('Mongoose disconnected on process termination');
                process.exit(0);
            });
        });
    }
}
module.exports = mongoConnection;
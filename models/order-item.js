const mongoose = require('mongoose'); // library for connecting with mongoDB in cloud

// Creating OrderItem schema for the database
const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
})

// creating model (It mostly start with capital letter)
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
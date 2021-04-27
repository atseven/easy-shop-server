const mongoose = require('mongoose'); // library for connecting with mongoDB in cloud

// Creating Products schema for the database
const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    },
})

// creating model (It mostly start with capital letter)
exports.Category = mongoose.model('Category', categorySchema);
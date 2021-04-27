const mongoose = require('mongoose'); // library for connecting with mongoDB in cloud

// Creating Products schema for the database
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, // It will pick the id from the Category table
        ref: 'Category', // referencing to the Category Table/Model.
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 300
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

// As you know, mongoDB automatically creates the _id attribute. Now what if we don't want to use underscore and just need the simple id attribute. To do this See the below four lines of code:
productSchema.virtual('id').get(function (){
    return this._id.toHexString();
})
productSchema.set('toJSON', {
    virtuals: true
})

// creating model (It mostly start with capital letter)
exports.Product = mongoose.model('Product', productSchema);
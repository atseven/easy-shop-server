const {Category} = require('../models/category')

const express = require('express');
const { response } = require('express');
const { route } = require('./products');
const { Mongoose } = require('mongoose');
const router = express.Router();

// get method (fetching all the rows/records/categories from the database)
router.get(`/`,async (req, res) => {

    // fetching all records in the database
    const categoryList = await Category.find();

    //if productList is empty
    if(!categoryList){
        res.status(500).json({success: true})
    }

    res.status(200).send(categoryList);
})

// get method (fetching particular row/record/category from the database)
router.get(`/:id`,async (req, res) => {

    // fetching a particular category from database
    const category = await Category.findById(req.params.id);

    //if productList is empty
    if(!category){
        res.status(500).json({success: false, message: 'The category with the given ID is not found'})
    }

    res.status(200).send(category);
})

//post method
router.post(`/`, async (req, res) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });

    // category = await category.save();
    // if(!category){
    //     return res.status(404).send("The category cannot be created");
    // }
    // res.send(category);
    category.save().then((createdCategory) => {
        res.status(201).json()
    }).catch((err) => {
        res.status(500).json({
            error: err,
            success: false
        })
    });
})

// Delete Category
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
    .then((category) => {
        // if the ID found in the database
        if(category){
            return res.status(200).json({success: true, message: 'Category is deleted'});
        }
        else{
            return res.status(404).json({success: false, message: 'Category is not found'})
        }
    }).catch((err) => {
        return res.status(400).json({success: false, error: err});
    })
})

// Update the data
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {new: true} // This means return the new updated data.
    )
    if(!category)
        res.status(500).json({success: false, message: 'The category with the given ID is not found'})
    res.status(200).send(category);

})
module.exports = router;
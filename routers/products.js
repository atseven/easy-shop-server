const {Product} = require('../models/product') // it returns an object so we save it in curly braces.

const express = require('express');
const mongoose = require('mongoose');
const { response } = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const multer = require('multer');

// Allowed file types
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValidFileType = FILE_TYPE_MAP[file.mimetype]; // mimetype return the file of type in the format like image/png etc...
      var uploadError = new Error("Invalid File Type");
      if(isValidFileType)
        uploadError = null

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(' ', '-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })

const uploadOptions = multer({ storage: storage })

// get method
router.get(`/`,async (req, res) => {

    // http://localhost:3000/api/v1/products?categories=243237,3340373
    // Now our goal is to fetch the query parameter like above in the URL and return those products which are exist in those categories
    let filter = {}

    // if the user write something in the query parameter
    if(req.query.categories){
        filter = {
            category: req.query.categories.split(',')
        }
    }
    // fetching all records from the database which are present in the above mentioned categories
     const productList = await Product.find(filter).populate('category');
    //if you want to extract just name & image from the records and want to exclude _id (add the -ve sign before it if you want that id does not show on the output). Then see below:
    // const productList = await Product.find().select("name image -_id");

    //if productList is empty
    if(!productList){
        res.status(500).json({success: false})
    }

    res.send(productList);
})

// get method for particular product
router.get(`/:id`,async (req, res) => {

    // const product = await Product.findById(req.params.id);
    // if you want that the category id that is stored in product item, then that category id refer to the categories table in the database and fetch those records that belongs to that category
    const product = await Product.findById(req.params.id).populate('category'); // Remember 'category' must be some id so that the node js go to the categories table and find the record which is associated to that category and return it back

    //if product is not fetched
    if(!product){
        res.status(500).json({success: false})
    }

    res.send(product);
})

//post method. Now we are also handling how to upload image
router.post(`/`, uploadOptions.single('image') ,async (req, res) => {
    // Before posting/adding product to database, first check that the user input the right category. we will validate the category from the categories table
    console.log(req.body.category);
    const category = await Category.findById(req.body.category);
    if(!category)
        return res.status(400).send("Invalid Category");

    // if the user does not attatch any image then throws an error
    const file = req.file;
    if(!file)
        return res.status(400).send("No image is attatched");

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, //https://localhost:3000/public/uploads/image-2900732.jpg
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product.save().then((createdProduct) => {
        res.status(201).json({success: true, message: "Product created successfully"});
    }).catch((err) => {
        res.status(400).json({
            message: "Product is not created",
            success: false
        })
    });
})

// update a product
router.put('/:id', async (req, res) => {
    // First check whether the format of ID is correct
    if(!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send("Invalid Product Id");

    // check whether the product has valid category
    const category = await Category.findById(req.body.category);
    if(!category)
        return res.status(400).send("Invalid Category");

    // update the product
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new: true} // This means return the new updated data.
    )
    if(!product)
        res.status(500).send({success: false, message: 'The product with the given ID is not found'});
    res.status(200).send(product);

})

// Delete Product
router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
    .then((product) => {
        // if the ID found in the database
        if(product){
            return res.status(200).json({success: true, message: 'Product is deleted'});
        }
        else{
            return res.status(404).json({success: false, message: 'Product is not found'})
        }
    }).catch((err) => {
        return res.status(400).json({success: false, error: err});
    })
})

// Fetching the total products in the database
router.get(`/get/count`, async (req, res) => {

    // fetching the length of products in the products table in database
     const productCount = await Product.countDocuments((count) => count);

    //if productCount is empty
    if(!productCount){
        res.status(500).json({success: false});
    }
    res.send({
        productCount: productCount
    });
})

// Fetching the featured products (The products that to be displayed on the home page)
router.get(`/get/featured/:count`, async (req, res) => {

    // First get input from user how much featured products he want to display. This is true for admin as well
    const count = req.params.count ? req.params.count: 0; 
    // fetching the products which has isFeatured to be true and also define how much isFeatured products want to fetch
     const products = await Product.find({isFeatured: true}).limit(+count); // the above count variable is in string. So we convert it into numeric by adding + symbol before the count variable.

    //if products is empty
    if(!products){
        res.status(500).json({success: false});
    }
    res.send(products);
})

// Upload the gallery images. We set the max limit 10 per request
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    // First check whether the format of ID is correct
    if(!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send("Invalid Product Id");

    const imagePaths = []
    const files = req.files;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if(files){
        files.map(file => {
            imagePaths.push(`${basePath}${file.filename}`);
        })
    }


    // update the product
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagePaths
        },
        {new: true} // This means return the new updated data.
    )
    if(!product)
        res.status(500).send({success: false, message: 'The product with the given ID is not found'});
    res.status(200).send(product);

})


module.exports = router;
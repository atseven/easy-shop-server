const {Order} = require('../models/order')

const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

// get method
router.get(`/`,async (req, res) => {

    // fetching all records from the database & populating the user attribute which is a ref to the users table
    // const orderList = await Order.find().populate('user');
    // fetching just the name attribute from all of the other user attributes
    // const orderList = await Order.find().populate('user', 'name');
    // Sorting the output according the dateOrdered attribute (oldest to newest) 
    // const orderList = await Order.find().populate('user', 'name').sort('dateOrdered');
    // Sorting the output according the dateOrdered attribute (newest to oldest) 
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    //if orderList is empty
    if(!orderList){
        res.status(500).json({success: true})
    }

    res.send(orderList);
})

// fetch a particular order
router.get(`/:id`,async (req, res) => {

    // Fetch a particular order
    // const order = await Order.findById(req.params.id).populate('user', 'name');
    // if you want to populate all the attributes that need to be populate. Then you can do that in following way:
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    // .populate({ //as now we are populating an array orderItems. So, we can follow the below way to how to populate the array
    //     path: 'orderItems', // name of attribute which has arrays of items in orders table
    //     populate: 'product' // populate the product attribute inside orderItems
    // })
    .populate({
        path: 'orderItems',
        populate: { // After populating the orderItems attribute, then you will see that you also need to populate the product attribute
            path: 'product', 
            populate: 'category' // populate the another category attribute inside product
        }
    })

    //if order is empty
    if(!order){
        res.status(500).json({success: true})
    }

    res.send(order);
})

//post method
router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => { // map function is used for looping. Promise function is used to make one promise. If the function returning more that one promise, then Promise.all make it one and then return it
        // creating a new item for the OrderItem Table in database
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id; // we just the id of orderItem.
    }))

    const orderItemsIdsResolved = await orderItemsIds;

    // calculating the total Price of all order Items
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    // Sum all the values in an array
    const totalPrice = totalPrices.reduce((a,b) => a+b, 0);

    const order = new Order({
        orderItems: orderItemsIdsResolved, //Array of ids of the orderItems
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });

    order.save().then((order) => {
        res.status(201).send(order);
    }).catch((err) => {
        res.status(500).json({
            error: "The order is not created",
            success: false
        })
    });
})

// Update the Order
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true} // This means return the new updated data.
    )
    if(!order)
        res.status(500).json({success: false, message: 'The order with the given ID is not found'})
    res.status(200).send(order);

})

// Delete order
router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id)
    .then(async order => {
        // if the ID found in the database. Now our goal is to also delete the orderItems from the ordersItems table also.
        if(order){
            // Deleting the orderItems from the orderItems table
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            })

            return res.status(200).json({success: true, message: 'order is deleted'});
        }
        else{
            return res.status(404).json({success: false, message: 'order is not found'})
        }
    }).catch((err) => {
        return res.status(400).json({success: false, error: err});
    })
})

// Get Total sales by summing up all the total prices of the orders
router.get('/get/totalsales', async (req, res) => {
    // Aggregate method is used to combine all the orders and use the mongoose reserved variable $sum to calculate sum of all the totalPrice of all orders
    const totalSales = await Order.aggregate([{
            $group: {_id: null, totalsales: {$sum: '$totalPrice'}}}
    ])

    if(!totalSales)
        return res.status(400).send("The order sales cannot be generated");
    // res.send(totalSales); // this will return two things. One is id and second is total sales. if you just want the totalsales then see below:
    res.send({totalSales: totalSales.pop().totalsales});
})

// Fetching the total orders in the database
router.get(`/get/count`, async (req, res) => {

    // fetching the length of products in the products table in database
     const orderCount = await Order.countDocuments((count) => count);

    //if orderCount is empty
    if(!orderCount){
        res.status(500).json({success: false});
    }
    res.send({
        orderCount: orderCount
    });
})

// get method
router.get(`/get/userorders/:userid`,async (req, res) => {

    const userOrderList = await Order.find({user: req.params.userid})
    .populate({
        path: 'orderItems',
        populate: { // After populating the orderItems attribute, then you will see that you also need to populate the product attribute
            path: 'product', 
            populate: 'category' // populate the another category attribute inside product
        }
    }).sort({'dateOrdered': -1});

    //if userOrderList is empty
    if(!userOrderList){
        res.status(500).json({success: true})
    }

    res.send(userOrderList);
})

module.exports = router;
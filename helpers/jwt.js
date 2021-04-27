const expressJWT = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    // The following function first validate the generated token is belonged to the particular secret. If the token will be different. Mean to say it is not related to secret then the user will not be able to access the APIs
    return expressJWT({
        secret,
        algorithms: ['HS256'], // You can go to jwt.io website and can see the poplular algorithms to generate web tokens.
        isRevoked: isRevoked   // This will help us in separating the user Role & Admin Role. See the method at the end

    }).unless({ // This means which APIs you want to allow to access without user login. Mean to say without the token, which which APIs the user can use.
        path: [ // Public APIs that anyone can use without authentication
            `${api}/users/login`, // The user can login even it has not the token
            `${api}/users/register`, // The user can register even it has not the token

            // The following line means, without logging in or in other words without getting the token, the user can see the products on the page. We set the GET method here. Mean to say the user will just see the products but cannot be able to send any POST request. If he want then he must have to be login or in other words must have token to do that
            // {url: '/api/v1/products', methods: ['GET', 'OPTIONS']} 
            // But above you can see what if the user want to access the page '/api/v1/products/get/featured/3', then he will not be able to access. So for this we have to write the code again. So, instead of writing multiple lines of code for the similar task. we use the regular expressions. See below
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']}, 
            // Now the above line of code means whatever comes after the /products, that all can be accessed by the user without logging in or in other words without having the token.

            // same we will do this for the categories as well.
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            // Anyone can see gallery images of products. But you also have to add this folder in app.js,. GO there and see
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']}
        ]
    })
}

async function isRevoked(req, payload, done) {
    // if the person who is logging in is not admin then he cannot POST, DELETE, UPDATE products
    if(!payload.isAdmin)
        done(null, true); // This means that reject this user and don't give it access further
    // if the user is an admin, then give it all access without any rejection
    done();
}
module.exports = authJwt;
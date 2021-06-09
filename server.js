const express 	 = require('express')
const logger	 = require('morgan')
const bodyParser = require('body-parser')
const path       = require('path')
const cors = require('cors')
const Joi 		 = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

// routes
const usersRoutes = require('./routes/users.routes')
const userDetailsRoutes = require('./routes/userDetail.routes')
const productsRoutes = require('./routes/products.routes')
const categoriesRoutes = require('./routes/categories.routes')
const checkoutRoutes = require('./routes/checkout.routes')
const cartRoutes = require('./routes/cart.routes')

const wishlistRoutes = require('./routes/wishlist.routes')

const resetPassword = require('./routes/resetPassword.routes')


const app	 = express()
 
app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())


const config = require('config')

const mongoose = require('mongoose')

if (!config.get('PrivateKey')) {
    console.error('FATAL ERROR: PrivateKey is not defined.');
    process.exit(1);
}

mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/shovee', {
    useNewUrlParser: true,
    useFindAndModify: false, 
    dbName: 'shovee'
}).then(() => {
    console.log('connection success')
}).catch(err => {
    console.log(`connection error `, err)
    process.exit();
})

// public routes
app.get('/', (req, res) => {
	res.json({message: 'server running'})
})

app.use('/', resetPassword)
app.use('/users', usersRoutes)
app.use('/users', userDetailsRoutes)
app.use('/products', productsRoutes)
app.use('/categories', categoriesRoutes)
app.use('/checkout', checkoutRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)



const port = process.env.PORT || 3000
app.listen(port, ()=>{
	console.log(`server running in port ${port}`)
})
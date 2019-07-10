const { userModel, validateUser } = require('../models/users.models')
const userDetailModel = require('../models/userDetails.models')
const bcrypt 	= require('bcrypt')
const Joi 		= require('@hapi/joi')
const _ 		= require('lodash')

// register user
exports.create = async (req, res, next) => {

	// First Validate The Request
    const { error } = validateUser(req.body);
    if (error) {
        return res.status(400).json({
        	status: 'failed',
        	message: `${error.details[0].message}`
        })
    }

    // Check if this user already exisits
    let user = await userModel.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({
        	status: 'failed',
        	message: 'That user already exisits!'
        });
    } else {
	    user = new userModel({
			email: req.body.email,
			username: req.body.username,
			phone: req.body.phone,
			password: req.body.password
		})

		await user.save()
		.then(data => {
			userModel.findById(data._id)
			.then(dataRegister => {

				// const token = jwt.sign({ _id: users._id }, config.get('PrivateKey'))
				const token = user.generateAuthToken()
                res.header('x-auth-token', token)

                let address = {
                    provinsi: '',
                    kab: '',
                    kec: '',
                    alamat_lengkap: '',
                    pos: ''
                }

                const userDetail = new userDetailModel({
                    user: dataRegister._id,
                    name: '',
                    gender: 'L',
                    tanggal_lahir: '',
                    image_profil: '',
                    alamat: address
                })

                userDetail.save()

				res.json({
					status: 'success',
					message: "User added successfully",
					data: _.pick(dataRegister, ['_id', 'email', 'username', 'phone'])
				})
			})
		})
		.catch(err => {
			return res.status(500).json({
	            status: 500,
	            message: err.message || 'some error'
	        })
		})
    }
}

//login user
exports.auth = async (req, res, next) => {

	// First Validate The HTTP Request
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({
        	status: 'failed',
        	message: error.details[0].message
        });
    }

    //  Now find the user by their email address
    let user = await userModel.findOne({ email: req.body.user })
    if (!user) {
        user = await userModel.findOne({ username: req.body.user })
	    if (!user) {
	     	user = await userModel.findOne({ phone: req.body.user })
		    if (!user) {
		     	return res.status(400).json({
        			status: 'failed',
        			message: 'User not found.'
        		}); 
		    } 
	    }
    }

    // validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if(!validPassword) {
    	return res.status(400).json({
        	status: 'failed',
        	message: 'Wrong password.'
        });
    }

    // const token = jwt.sign({ _id: user._id }, config.get('PrivateKey'))
    const token = user.generateAuthToken()

    res.json({
    	status: 'success',
    	data: _.pick(user, ['_id', 'email', 'username', 'phone']),
    	token: token
    })

} 

// validate login
function validateLogin(req) {
    const schema = {
        user: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(req, schema);
}
const userDetailModel = require('../models/userDetails.models')
const {_doMultipleUpload} = require('../middleware/upload.middleware')

exports.find = async (req, res) => {
	let user = req.user

	await userDetailModel.findOne({user}).populate('user')
	.then(data => {
		if(!data){
			return res.status(400).json({
				status: 'failed',
				data: [] 
			})
		}

		res.json({
			status: 'success',
			data
		})
	})
	.catch(err => {
		return res.status(500).json({
	        status: 500,
            message: err.message || 'some error'
	    })
	})
}

exports.setUserDetail = async (req, res) => {
	console.log(req)
	let user = req.user
	let images

	if(req.files && req.files.length > 0) {
        images = await _doMultipleUpload(req)
    	req.body.image_profil = images[0];
    }

    let address = {}
    await userDetailModel.findOne({user})
	.then(data => {
	    address = {
	    	province: req.body.province || data.address.province || '',
	    	city: req.body.city || data.address.city || '',
	    	district: req.body.district || data.address.district || '',
	    	full_address: req.body.full_address || data.address.full_address || '',
	    	zip_code: req.body.zip_code || data.address.zip_code || ''
	    }
	})

    req.body.address = address

	await userDetailModel.findOneAndUpdate({user}, req.body)
	.then(data => {
		userDetailModel.findOne({_id: data._id})
		.populate('user', '-password')
		.then(dataUpdate => {
			res.json({
				status: 'success',
				data: dataUpdate
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
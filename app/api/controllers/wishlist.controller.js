'use strict'

const wishlistModel = require('../models/wishlist.model')

exports.findAllUserWishlist = async (req, res) => {
    await wishlistModel.find({
        user: req.user._id
    }).populate({path:'user', select: ['_id']}).populate('product').populate({path : 'product' , populate : 'seller'})
            .then(data => (
                res.json({
                    status: 200,
                    data
                })
            ))
            .catch(err => {
                return res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            })
}

exports.create = async (req, res) => {
    const { product } = req.body
    const user = req.user._id
    if (!user || !product) {
        return res.status(400).json({
            status: 400,
            message: 'product is required'
        })
    }

    await wishlistModel.find({user : {_id : user} ,product : { _id : product}} , async function(err , foundList){
        if(foundList.length !== 0)
        {
            await wishlistModel.deleteMany({user : {_id : user} ,product : { _id : product}} , function(err){
                if(err)
                {
                    return res.status(500).json({
                        status: 500,
                        message: err.message || 'same error'
                    })
                }
            })
        }
        await wishlistModel.create({ user, product })
            .then(data => {
                wishlistModel.findById(data._id).populate('user').populate('product')
                    .then(createdData => (
                        res.json({
                            status: 200,
                            data: createdData
                        })
                    ))
            })
            .catch(err => {
                return res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            })
    })
}

exports.delete = async (req, res) => {
    await wishlistModel.findByIdAndDelete(req.params.id)
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        status: 404,
                        message: `Wishlist not found with id = ${req.params.id}`
                    }) 
                }

                res.json({
                    status: 200,
                    _id: req.params.id
                })
            })
            .catch(err => {
                if(err.kind === 'ObjectId') {
                    res.status(404).json({
                        status: 404,
                        message: `Wishlist not found with id = ${req.params.id}`
                    })
                }

                res.status(500).json({
                    status: 500,
                    message: err.message || 'same error'
                })
            })
}
'use strict'

const cloudinary = require('cloudinary')
cloudinary.config({
    cloud_name: "dimkw1elb",
    api_key: "553688513676728",
    api_secret: "NEP1GmpvrM7z_CSsNmvfagWr0e8"
})

exports.uploader = cloudinary.uploader
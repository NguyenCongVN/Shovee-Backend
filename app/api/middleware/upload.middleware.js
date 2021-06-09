const { dataUri } = require('./multer.middleware')
const { uploader } = require('../../../config/cloudinary.config')

_doMultipleUpload = async (req) => {
    if (req.files) {
        const data = []
        for(let i=0;i< req.files.length;i++) {
            try{
                const file = dataUri(req.files[i]).content
                await uploader.upload(file, (result) => {console.log(result);data.push(result.url)})
            }
            catch(err){
                console.log(err)
            }
        }
        return data
    }
}

module.exports = {_doMultipleUpload}
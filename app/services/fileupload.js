const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

aws.config.update({
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  region: 'ap-southeast-2'
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
  if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
    cb(null, true)
  } else {
    cb(new Error("Invalid mime type, only JPEG and PNG"), false)
  }
}

const upload = (name) => multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: 'petitionthis-images',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    //name of file
    key: function (req, file, cb) {
      let mimetype = file.mimetype
      var extension = ""
      if(mimetype === "image/jpeg"){
        extension = ".jpg"
      }
      else if(mimetype === "image/png"){
        extension = ".png"
      } else if(mimetype ==="image/gif") {
        extension = ".gif"
      }
      console.log(mimetype)
      cb(null, `${name}${extension}`)
    }
  })
})

module.exports = upload
const s3 = require("s3-node");
const crypto = require("crypto");
const fs = require("fs");

const client = s3.createClient({
	maxAsyncS3: 20, // this is the default 
	s3RetryCount: 3, // this is the default 
	s3RetryDelay: 1000, // this is the default 
	multipartUploadThreshold: 20971520, // this is the default (20 MB) 
	multipartUploadSize: 15728640, // this is the default (15 MB) 
	s3Options: {
		// Using the keys from our AWS IAM user
		accessKeyId: process.env.AWS_ID,
		secretAccessKey: process.env.AWS_SECRET,
		
		// any other options are passed to new AWS.S3() 
		// See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
	},
});

module.exports = {
	uploadImage: async function(uid, file) {
			const params = {
			  localFile: file.path,
			  s3Params: {
				Bucket: process.env.AWS_BUCKET,
				Key: `users/${uid}/${file.name}`, // File path of location on S3
				ACL: "public-read"
			  },
			};
			return client.uploadFile(params);
	},
	deleteFromS3: async function (path) {
		const params = {
			  Bucket: process.env.AWS_BUCKET,
			  Delete: {
				  Objects: [{
				  Key: path
			  		}]
			}
		  };
		  return client.deleteObjects(params);
	}
}
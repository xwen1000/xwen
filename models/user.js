const mongoose = require('./model');
const User = mongoose.model('User', {
	username: String,
	access: {
		type: Number,
		default: 0
	},
	password: {
		type: String,
		default: ''
	},
	salt: {
		type: String,
		default: ''
	},
	createTime: {
		type: Date,
		default: new Date()
	},
	updateTime: {
		type: Date,
		default: new Date()
	}
});
module.exports = User;
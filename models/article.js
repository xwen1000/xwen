const mongoose = require('./model');
const Article = mongoose.model('Article', {
	title: {
		type: String,
		default: ''
	},
	username: {
		type: String,
		default: ''
	},
	content: {
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
module.exports = Article;
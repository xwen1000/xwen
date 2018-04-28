const express = require('express');
const router = express.Router();

const User = require('../models/user');

router.get('/u', function(req, res){
	res.render('ueditor');
});

const redis = require('redis');
const client = redis.createClient();

router.get('/redis', async function(req, res){
	res.send(await client.get());
});

router.get('/data', async function(req, res){
	res.send(await User.find());
});
const crypto = require('crypto');
const sha1 = crypto.createHash('sha1');
const stringRandom = require('string-random');
const salt = stringRandom();
sha1.update('123456');
sha1.update(salt);
router.get('/db', async function(req, res){
	res.send(await User.findByIdAndUpdate('5ae038ec27565f4024f79d8b', {
		salt,
		password: sha1.digest('hex')
	}));
});

module.exports = router;

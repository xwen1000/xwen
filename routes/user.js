const express = require('express');
const router = express.Router();
const User = require('../models/user');
router.get('/list', async function(req, res){
	const list = await User.find();
	res.send(list);
});
router.get('/', async function(req, res){
	res.render('index', {
		part: 'user/list'
	});
});
router.get('/updacc/:id', async function(req, res){
	if(!req.params.id || req.params.id == req.session.user.id)
	{
		res.render('error', {
			msg: '参数有误'
		});
	}else{
		const id = req.params.id;
		const access = parseInt(req.query.access) === 1 ? 0 : 1;
		const userData = await User.findByIdAndUpdate(id, {
									access: access,
									updateTime: new Date()
								});
		res.redirect('/user');
	}
});
router.get('/delete/:id', async function(req, res){
	if(!req.params.id || req.params.id == req.session.user.id)
	{
		res.render('error', {
			msg: '参数有误'
		});
	}else{
		const id = req.params.id;
		const u1 = await User.deleteOne({_id: id});
		res.redirect('/user');
	}
});
module.exports = router;

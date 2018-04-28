const express = require('express');
const router = express.Router();
const Article = require('../models/article');
router.get('/', function(req, res){
	res.render('index', {
		part: 'article/list'
	});
});
router.get('/add', function(req, res){
	res.render('index', {
		part: 'article/add'
	});
});
router.post('/add', async function(req, res){
	const {title, content} = req.body;
	if(!title || !content)
	{
		res.render('error', {
			msg: '参数有误'
		});
	}else{
		const a1 = await Article.create({
							title,
							content,
							username: req.session.user.username
						});
		if(a1)
		{
			res.redirect('/content');
		}else{
			res.render('error', {
				msg: '添加失败'
			});
		}
	}
});
router.get('/list', async function(req, res){
	const list = await Article.find();
	res.send(list);
});
router.get('/detail/:id', async function(req, res){
	const data = await Article.findById({_id: req.params.id});
	res.render('index', {
		data,
		part: 'article/detail'
	});
});
router.get('/delete/:id', async function(req, res){
	if(!req.params.id)
	{
		res.render('error', {
			msg: '参数有误'
		});
	}else{
		const id = req.params.id;
		const a1 = await Article.deleteOne({_id: id});
		res.redirect('/content');
	}
});



















module.exports = router;
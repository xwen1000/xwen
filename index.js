const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
server.listen(3000);

const mongoose = require('./models/model');
const credentials= require('./credentials');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(require('cookie-parser')(credentials.cookieSecret));

const connect = require('connect');

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const store = new RedisStore({
	host: 'localhost',
	port: 6379
});
app.use(session({
	store: store,
	secret: credentials.cookieSecret,
  	resave: false,
  	saveUninitialized: false,
  	cookie: {maxAge: 60000*60*2}
}));

const path = require('path');

const ejs = require('ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('.ejs', ejs.__express);
app.set('view engine', 'ejs');

const lessMiddleware = require('less-middleware');
app.use(lessMiddleware(path.join(__dirname, 'public'), {
	force: true
}));
app.use(express.static(path.join(__dirname, 'public')))

const vhost = require('vhost');
const router = express.Router();
app.use(vhost('admin.xwen.com', router));

const csurf = require('csurf');
app.use(csurf({cookie: true}));

const crypto = require('crypto');

const stringRandom = require('string-random');

const svgCaptcha = require('svg-captcha');
app.get('/captcha', function(req, res){
	const captcha = svgCaptcha.create();
	req.session.captcha = captcha.text;
	res.type('svg');
	res.status(200).send(captcha.data);
});

const User = require('./models/user');

app.use('*', function(req, res, next){
	res.locals.csrfToken = req.csrfToken();
	const exceptArr = ['/register', '/login', '/logout', '/captcha'];
	if(exceptArr.indexOf(req.originalUrl) < 0)
	{
		if(req.session.user)
		{
			res.locals.user = req.session.user.username;
			next();
		}else{
			res.locals.user = '';
			res.redirect('/login');
		}
	}else{
		res.locals.user = '';
		next();
	}
});

app.get('/', function(req, res){
	res.render('index', {
		part: 'website'
	});
});

app.get('/setting', function(req, res){
	res.render('index', {
		part: 'setting'
	});
});
app.get('/register', function(req, res){
	res.render('register');
});

app.get('/login', function(req, res){
	res.render('login');
});
app.post('/register', async function(req, res){
	const {username, password, password1, captcha} = req.body;
	if(!username || !password || !password1 || password != password1 || req.session.captcha != captcha)
	{
		res.render('error', {
			msg: '参数有误'
		});
	}else{
		const record = await User.findOne({username});
		if(record)
		{
			res.render('error', {
				msg: '已存在'
			});
		}else{
			const salt = stringRandom();
			const sha1 = crypto.createHash('sha1');
			sha1.update(password);
			sha1.update(salt);
			const u1 = await User.create({
							username,
							password: sha1.digest('hex'),
							access: username == 'xwen' ? 1 : 0,
							salt
						});
			if(u1)
			{
				res.render('error', {
					msg: '请等待审核'
				});
			}else{
				res.render('error', {
					msg: '注册失败'
				});
			}
		}
	}
});
app.post('/login', async function(req, res){
	const {username, password, captcha} = req.body;
	if(!username || !password || req.session.captcha != captcha)
	{
		res.render('error', {
			msg: '参数有误'
		});
	}else{
		const record = await User.findOne({username});
		if(record && parseInt(record.access) === 1)
		{
			const sha1 = crypto.createHash('sha1');
			sha1.update(password);
			sha1.update(record.salt);
			if(sha1.digest('hex') == record.password)
			{
				req.session.user = {
						username: record.username,
						id: record._id
					}
				res.redirect('/');
			}else{
				res.render('error', {
						msg: '登陆失败'
					});
			}
		}else{
			res.render('error', {
					msg: '登陆失败'
				});
		}
	}
});
app.get('/logout', function(req, res){
	req.session.user = null;
	res.redirect('/login');
});

app.use('/user', require('./routes/user'));
app.use('/content', require('./routes/article'));
app.use('/test', require('./routes/test'));

app.use(function(err, req, res, next){

	res.locals.user = '';
	if(err.code == 'EBADCSRFTOKEN')
	{
		res.status(403);
		res.render('error', {msg: 'csrfToken'});

	}else{
		res.status(500);
		console.log(err);
		res.render('error', {msg: 'error'});
	}
});














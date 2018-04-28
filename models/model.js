const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/xwen');
module.exports = mongoose;
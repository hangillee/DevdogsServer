var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    id: String,
    pw: String,
    name: String
});

module.exports = mongoose.model('Users', userSchema);
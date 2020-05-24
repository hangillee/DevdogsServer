var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: String,
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    content: String,
    date: Date
});

module.exports = mongoose.model('Posts', postSchema);
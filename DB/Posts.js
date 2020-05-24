var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    _id: Schema.Types.ObjectId,
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    title: String,
    content: String,
    date: Date
});

module.exports = mongoose.model('Post', postSchema);
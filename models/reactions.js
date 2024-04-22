const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    type: { type: String, enum: ['like', 'love', 'laugh', 'sad', 'angry'], default: 'like' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Reaction', reactionSchema);
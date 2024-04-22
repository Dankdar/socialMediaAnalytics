const Reaction = require('../models/reactions');
const Post = require('../models/posts');
const response = require("../helpers/responseApi");

exports.addReaction = async (req, res, next) => {
    try {
        const { postId, type, createdBy } = req.body;
        console.log(req)

        //
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }
        if (post.likes.includes(createdBy)) {
            post.likes = post.likes.filter(id => !id.equals(createdBy));
        }
        else{
            post.likes.push(createdBy);
        }

        await post.save();
        ///

        const existingReaction = await Reaction.findOne({ post: postId, createdBy });
        if (existingReaction) {
            existingReaction.type = type;
            await existingReaction.save();
            return res.status(200).send(existingReaction);
            res.status(200).json({
                data: response.success('Post reacted to successfully', existingReaction, 200)
            });
        }

        const reaction = new Reaction({
            post: postId,
            type,
            createdBy
        });
        await reaction.save();
        res.status(201).json({
            data: response.success('Reacted successfully', reaction, 201)
        });
    }
    catch (error) {
        return res.status(400).json({
            data: response.error(error, 400)
        });
    }
};

exports.removeReaction = async (req, res, next) => {
    try {
        const { reactionId } = req.params;


        const reaction = await Reaction.find({
            _id: reactionId
        });

        if (!reaction) {
            return res.status(404).send('Reaction not found or user not authorized');
        }

        //
        const post = await Post.findById(reaction[0]?.post);
        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }
        post.likes = post.likes.filter(id => !id.equals(reaction[0].createdBy));
        await post.save();
        ///

        const unreact = await Reaction.findOneAndDelete({
            _id: reactionId
        });

        // res.status(200).send({ message: 'Reaction removed' });
        res.status(200).json({
            data: response.success('Reaction removed', unreact, 200)
        });
    }
    catch (error) {
        res.status(500).send(error);
    }
};
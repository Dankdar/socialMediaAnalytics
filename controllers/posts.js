const Post = require('../models/posts');
const response = require("../helpers/responseApi");
const { ObjectId } = require('mongoose').Types;

exports.createPost = async (req, res, next) => {
    try {
        const post = new Post({
            createdBy: req.body.createdBy,
            content: req.body.content,
            attachments: req.file ? req.file.path : null
        });
        await post.save();
        res.status(201).json({ data: response.success('Post created successfully!', post, 201) });
    } catch (error) {
        res.status(400).json({ error: response.error('Failed to create post. ' + error.message, 400) });
    }
};

exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('createdBy', 'username name')
            .populate('comments.createdBy', 'username');

        if (!post) {
            return res.status(404).json({ error: response.error('Post not found', 404) });
        }

        res.status(200).json({ data: response.success('Post fetched successfully!', post, 200) });
    } catch (error) {
        res.status(500).json({ error: response.error(`Failed to fetch post: ${error.message}`, 500) });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ data: response.error("User ID is required", 400) });
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find({ createdBy: new ObjectId(userId) })
                .populate('createdBy', 'username name')
                .populate('comments.createdBy', 'username')
                .populate('likes', 'username name')
                .skip(skip)
                .limit(limit),
            Post.countDocuments({ createdBy: userId })
        ]);

        res.status(200).json({
            data: response.success('Posts fetched successfully', posts, 200),
            meta: {
                total: total,
                page: page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ data: response.error(`An error occurred: ${error.message}`, 500) });
    }
};

exports.updatePost = async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['content', 'attachments'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({
            error: response.error('Invalid updates!', 400)
        });
    }

    try {
        const { postId } = req.params;
        const { _id: userId } = req.user;

        const post = await Post.findOneAndUpdate(
            { _id: postId, createdBy: userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({
                error: response.error('Post not found or not authorized to update.', 404)
            });
        }

        res.status(200).json({
            data: response.success('Post updated successfully!', post, 200)
        });
    } catch (error) {
        res.status(500).json({
            error: response.error('Failed to update post.', 500)
        });
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.postId, createdBy: req.user._id });

        if (!post) {
            return res.status(404).send();
        }

        res.status(200).json({
            data: response.success("Successfully Deleted Post.",post,200)
        })
    } catch (error) {
        res.status(500).json({
            error: response.error(error,500)
        })
    }
};

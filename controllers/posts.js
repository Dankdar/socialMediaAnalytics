const Post = require('../models/posts');
const response = require("../helpers/responseApi");


exports.createPost = async (req, res, next) => {
    try {
        const post = new Post({
            createdBy: req.body.createdBy,
            content: req.body.content,
            attachments: req.file.path
        });
        await post.save();
        res.status(201).send(post);
    }
    catch (error) {
        res.status(400).send(error);
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('createdBy', 'username name')
            .populate('comments.createdBy', 'username');
        if (!post) {
            return res.status(404).send();
        }
        res.send(post);
    }
    catch (error) {
        res.status(500).send(error);
    }
};


// exports.getAllPosts = async (req, res, next) => {
//     try {
//         const posts = await Post.find({_id: mongoose.Types.ObjectId(req.body.id)})
//             .populate('createdBy', 'username name')
//             .populate('comments.createdBy', 'username');
//
//         if (!posts) {
//             res.status(200).json({
//                 data: response.error("no Posts found", 200)
//             })
//         }
//         res.status(200).json({
//             data: { posts: response.success('Posts Fetched', posts, 200),
//                 total: posts.length
//             }
//         })
//     } catch (error) {
//         res.status(500).json({
//             data: response.error(error, 500)
//         })
//     }
// };

exports.getAllPosts = async (req, res) => {
    try {
        console.log(req.params)
        const userId = req.params.postId
        if (!userId) {
            return res.status(400).json({
                data: response.error("User ID is required", 400)
            });
        }

        // Fetch posts created by the specific user
        const posts = await Post.find({ createdBy: userId })
            .populate('createdBy', 'username name')
            .populate('comments.createdBy', 'username');

        // Check if the posts array is empty
        if (posts.length === 0) {
            return res.status(200).json({
                data: response.error("No posts found for this user", 200)
            });
        }

        // Respond with all posts and their total count
        res.status(200).json({
            data: response.success('Posts fetched successfully', posts, 200),
            total: posts.length
        });
    } catch (error) {
        res.status(500).json({
            data: response.error(`An error occurred: ${error.message}`, 500)
        });
    }
};


exports.updatePost = async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['content', 'attachments'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const post = await Post.findOne({ _id: req.params.postId, createdBy: req.user._id });

        if (!post) {
            return res.status(404).send();
        }

        updates.forEach(update => post[update] = req.body[update]);
        await post.save();
        res.send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.postId, createdBy: req.user._id });

        if (!post) {
            return res.status(404).send();
        }

        res.send(post);
    } catch (error) {
        res.status(500).send(error);
    }
};

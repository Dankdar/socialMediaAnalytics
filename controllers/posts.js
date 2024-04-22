const Post = require('../models/posts');


exports.createPost = async (req, res, next) => {
    try {
        // console.log("=>",req.body)
        const post = new Post({
            createdBy: req.body.createdBy,
            content: req.body.content,
            attachments: req.file.path
        });
        await post.save();
        res.status(201).send(post);
    } catch (error) {
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
    } catch (error) {
        res.status(500).send(error);
    }
};


// exports.getAllPosts = async (req, res, next) => {
//     try {
//         const post = await Post.find({_id:req.params.postId})
//             .populate('createdBy', 'username name')
//             .populate('comments.createdBy', 'username');
//         if (!post) {
//             return res.status(404).send();
//         }
//         res.send(post);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };s
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

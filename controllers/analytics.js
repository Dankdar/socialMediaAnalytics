const Post = require('../models/posts');
const Reaction = require('../models/reactions');


exports.getPostAnalytics = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }

        // Calculate analytics data
        const reactions = await Reaction.find({ post: postId });
        const reactionCounts = reactions.reduce((acc, reaction) => {
            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
            return acc;
        }, {});

        const analytics = {
            totalLikes: reactionCounts.like || 0,
            totalLoves: reactionCounts.love || 0,
            totalLaughs: reactionCounts.laugh || 0,
            totalSads: reactionCounts.sad || 0,
            totalAngrys: reactionCounts.angry || 0,
            totalComments: post.comments.length,
            totalShares: post.sharedCount
        };

        res.send({ analytics });
    }
    catch (error) {
        res.status(500).send(error);
    }
};

const Post = require('../models/posts');
const Reaction = require('../models/reactions');
const response = require("../helpers/responseApi");
const { ObjectId } = require('mongoose').Types;

exports.getPostAnalytics = async (req, res) => {
    try {
        const { postId } = req.params;

        const results = await Post.aggregate([
            { $match: { _id: new ObjectId(postId) } },
            {
                $lookup: {
                    from: 'reactions',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'reactions'
                }
            },
            {
                $project: {
                    commentsLength: { $size: "$comments" },
                    sharedCount: 1,
                    reactions: 1
                }
            },
            {
                $unwind: {
                    path: "$reactions",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id",
                    commentsLength: { $first: "$commentsLength" },
                    sharedCount: { $first: "$sharedCount" },
                    reactions: {
                        $push: {
                            type: "$reactions.type",
                            count: 1
                        }
                    }
                }
            },
            {
                $unwind: {
                    path: "$reactions",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$reactions.type",
                    count: { $sum: "$reactions.count" },
                    commentsLength: { $first: "$commentsLength" },
                    sharedCount: { $first: "$sharedCount" }
                }
            }
        ]);

        if (!results.length) {
            return res.status(404).send({ message: 'Post not found' });
        }


        const analytics = {
            totalLikes: 0,
            totalLoves: 0,
            totalLaughs: 0,
            totalSads: 0,
            totalAngrys: 0,
            totalComments: results[0].commentsLength,
            totalShares: results[0].sharedCount
        };


        results.forEach(result => {
            if (result._id === 'like') analytics.totalLikes = result.count;
            else if (result._id === 'love') analytics.totalLoves = result.count;
            else if (result._id === 'laugh') analytics.totalLaughs = result.count;
            else if (result._id === 'sad') analytics.totalSads = result.count;
            else if (result._id === 'angry') analytics.totalAngrys = result.count;
        });

        res.status(200).json({
            data: response.success('Successfully fetched Analytics', analytics, 200)
        });
    }
    catch (error) {
        return res.status(500).json({
            data: response.error(error, 500)
        });
    }
};

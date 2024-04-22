const Reaction = require('../models/reactions');

exports.addReaction = async (req, res, next) => {
    try {
        const { postId, type, createdBy } = req.body;
        console.log(req)

        const existingReaction = await Reaction.findOne({ post: postId, createdBy });
        if (existingReaction) {
            existingReaction.type = type;
            await existingReaction.save();
            return res.status(200).send(existingReaction);
        }

        const reaction = new Reaction({
            post: postId,
            type,
            createdBy
        });
        await reaction.save();
        res.status(201).send(reaction);
    }
    catch (error) {
        res.status(400).send(error);
    }
};

exports.removeReaction = async (req, res, next) => {
    try {
        const { reactionId } = req.params;
        const reaction = await Reaction.findOneAndDelete({
            _id: reactionId,
            createdBy: req.user._id
        });

        if (!reaction) {
            return res.status(404).send('Reaction not found or user not authorized');
        }

        res.status(200).send({ message: 'Reaction removed' });
    }
    catch (error) {
        res.status(500).send(error);
    }
};

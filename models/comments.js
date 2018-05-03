// Модель комментария
const mongoose = require('mongoose');


const CommentSchema = mongoose.Schema({
    id: {
        type: Number,
        index: true,
    },
    text: {
        type: String,
    },
    likes: {
        type: Number,
        default: void 0,
    },
    owner_id: {
        type: Number,
    },
    date: {
        type: String,
    }
});

const Comments = module.exports = mongoose.model('Comments', CommentSchema);

// Сохранение записи
module.exports.createComment = function (newComment, callback) {
    newComment.save(callback);
};

// Количество записей
module.exports.getCount = function (query = {}, callback) {
    Comments.count(query, callback);
};

module.exports.get = function (post, callback) {
    let commentsArray = [];
    Comments.find({owner_id: post.id}, 'text id reposts likes from_id date').cursor()
        .on('data', (msg) => {
            let k = Math.floor(Math.random() * (9999999 - 1111111)) + 1111111,
                newPost = {
                    text: post.text,
                    id: k,
                    old_id: post._id,
                    reposts: post.reposts,
                    likes: post.likes,
                    comments: post.comments,
                    comment_text: msg.text,
                    comment_likes: msg.likes,
                    comment_date: msg.date,
                    date: post.date,
                };

            commentsArray.push({
                index: {
                    _id: k,
                }
            });
            commentsArray.push(newPost);
        })
        .on('end', () => {
            callback(commentsArray);
            // callback(true)
        });
};

// Получить все записи
module.exports.getComments = function(posts, callback) {
    Comments.find({}, 'text id reposts owner_id likes from_id date').or(posts).exec((err, data) => {
        callback(err, data);
    });

};
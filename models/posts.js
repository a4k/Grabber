// Модель записи
const mongoose = require('mongoose');
const Comments = require('../models/comments');


const PostSchema = mongoose.Schema({
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
    reposts: {
        type: Number,
        default: void 0,
    },
    comments: {
        type: Number,
        default: void 0,
    },
    date: {
        type: String,
    }
});

const Posts = module.exports = mongoose.model('Posts', PostSchema);

// Сохранение записи
module.exports.createPost = function (newPost, callback) {
    newPost.save(callback);
};

// Количество записей
module.exports.getCount = function (query = {}, callback) {
    Posts.count(query, callback);
};

// Получить все записи
module.exports.getPosts = function(page, callback) {
/*
    let posts = [], limit = 10,
        start = (page * limit);

    // Query the db, using skip and limit to achieve page chunks
    Posts.find({}, '*',{skip: start, limit: limit}).sort({date: -1}).exec(callback);
    */

    let postsArray = [], postsWithComments = [], posts = [];
    Posts.find({}, 'text id reposts likes comments date').cursor()
        .on('data', (post) => {
            if(post.comments > 0) {
                postsWithComments.push({owner_id: post.id});
                posts.push(post);
            } else {
                let k = Math.floor(Math.random() * (9999999 - 1111111)) + 1111111,
                    newPost = {
                        text: post.text,
                        id: k,
                        old_id: post._id,
                        reposts: post.reposts,
                        likes: post.likes,
                        comments: post.comments,
                        date: post.date,
                    };
                postsArray.push({
                    index: {
                        _id: k,
                    }
                });
                postsArray.push(newPost);
            }
        })
        .on('end', () => {
            callback(postsArray, postsWithComments, posts);
        });

};
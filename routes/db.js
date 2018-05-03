'use strict';
const mongoose = require('mongoose');
const Posts = require('../models/posts');
const Comments = require('../models/comments');




// Работа с базой данных
// Реализация на MongoDB
class DB {
    constructor() {
        mongoose.connect('mongodb://localhost/myuser');
        this.isConnect = false; // Подключились к DB или нет

    }
    getPosts(callback) {
        // Получение записей
        let $this = this;
        Posts.getPosts(0, (postsArray, postsWithComments, posts) => {

            Comments.getComments(postsWithComments, (err, data) => {
                if(err) {
                    reject(err);
                }
                let commentsArray = [];
                Promise.all(data.map((comment, e) => {
                    let post = posts.find((post) => {
                        return post.id === comment.owner_id;
                    });

                    let k = Math.floor(Math.random() * (9999999 - 1111111)) + 1111111,
                        newPost = {
                            text: post.text,
                            id: k,
                            old_id: post._id,
                            reposts: post.reposts,
                            likes: post.likes,
                            comments: post.comments,
                            comment_text: comment.text,
                            comment_likes: comment.likes,
                            comment_date: comment.date,
                            date: post.date,
                        };

                    commentsArray.push({
                        index: {
                            _id: k,
                        }
                    });
                    commentsArray.push(newPost);
                    return newPost;
                })).then((comments) => {
                    // Комментарии поста
                    callback(postsArray.concat(commentsArray));
                    // return comments;
                }).catch((err) => {
                    console.log('Во время получения записей из базы данных возникли ошибки. ' + err);
                });
            });
        })
    }

    getComments(msg, callback) {
        let postsArray = [];
        Comments.getComments(msg.id, (endc, comment) => {
            if(endc) {
                // console.log(postsArray);
                callback(postsArray);
            }
            if(!endc) {
                let k = Math.floor(Math.random() * (9999999 - 1111111)) + 1111111,
                    newPost = {
                        id: k,
                        old_id: msg._id,
                        comment_old_id: comment._id,
                        reposts: msg.reposts,
                        likes: msg.likes,
                        comments: msg.comments,
                        comment_likes: comment.likes,
                        text: msg.text,
                        comment_text: comment.text,
                        date: msg.date,
                        comment_date: comment.date,
                    };
                postsArray.push({
                    index: {
                        _id: k,
                    }
                });
                postsArray.push(newPost);
            }
        });
    }

    saveChunk(chunk, callback) {
        // Сохранение чанк в DB
        /*let $this = this;
        if(chunk) {
            Promise.all(chunk.map((post, i) => {
                return new Promise((resolve, reject) => {
                    const newPost = new this.Posts({
                        id: 1,
                        text: post,
                    });
                    newPost.save().then((savedPost) => {
                        resolve(savedPost);
                    }).catch((err) => {
                        reject(err);
                    })
                }).then((isSaved) => {
                    // Запись успешно сохранена
                    return isSaved;
                }).catch((noSaved) => {
                    // Возникла ошибка сохранения
                    return false;
                });
            })).then((chunk) => {
                callback(chunk);
            }).catch((err) => {
                console.log(err)
            });
        }*/
    }

    savePost(post, info, callback) {
        // Сохранение записи в DB
        if(info.type === 'comments') {
            // Это комменатарий
            // console.log('post save');
            // console.log(post);
            const newComment = new Comments(post);
            newComment.save().then((savedComment) => {
                callback(savedComment);
            }).catch((err) => {
                callback(err);
            });
        } else {
            // Это запись
            const newPost = new Posts(post);
            newPost.save().then((savedPost) => {
                callback(savedPost);
            }).catch((err) => {
                callback(err);
            });
        }

    }

}

module.exports = DB;
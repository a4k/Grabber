'use strict';
const {Transform} = require('stream');
const moment = require('moment');



// Изменение данных в потоке
class Transformer extends Transform {
    constructor(info = {},opt = {}) {
        super(opt);
        this.soc_type = info.soc_type; // Соц. сеть
        this.type = info.type; // Запись или комментарий
        this.on('error', (err) => {
            console.log('Возникла ошибка ', err);
        }).on('finish', () => {
            // console.log('finish');
        });

    }
    _transform(post, encoding, done) {
        // Изменение исходных данных под общую форму
        let newPost;
        if(this.soc_type === 'twitter') {
            // Это записи из твиттера
            newPost = {
                text: post.text,
                id: post.id,
                reposts: post.retweet_count,
                likes: post.favorite_count,
                comments: 0,
                date: moment(post.created_at, "ddd MMM DD HH:mm:ss +SSS YYYY").format('YYYY-MM-DD HH:mm:ss'),
            };

        } else if(this.soc_type === 'vk') {
            // Это записи из ВК
            if(this.type === 'post') {
                // Это запись
                newPost = {
                    text: post.text,
                    id: post.id,
                    reposts: post.reposts.count,
                    likes: post.likes.count,
                    comments: post.comments.count,
                    date: moment.unix(post.date).format('YYYY-MM-DD HH:mm:ss'),
                };
            } else {
                // Это комментарий
                newPost = {
                    text: post.text,
                    id: post.id,
                    likes: post.likes.count,
                    owner_id: post.owner_id,
                    date: moment.unix(post.date).format('YYYY-MM-DD HH:mm:ss'),
                };
            }
        } else if(this.soc_type === 'fb') {
            // Это записи из FB
            if(this.type === 'post') {
                // Это запись
                let text = post.message || '';
                text += post.name || '';
                text += post.description || '';

                newPost = {
                    text: text,
                    id: post.id,
                    reposts: post.shares.count,
                    likes: post.likes.count,
                    comments: post.comments.count,
                    date: moment(post.created_time, "YYYY-MM-DDTHH:mm:ss+SSS").format('YYYY-MM-DD HH:mm:ss'),
                };

            } else {
                // Это комментарий
                newPost = {
                    text: post.message,
                    id: post.id,
                    likes: post.likes.count,
                    owner_id: post.owner_id,
                    date: moment(post.created_time, "YYYY-MM-DDTHH:mm:ss+SSS").format('YYYY-MM-DD HH:mm:ss'),
                };
            }
        } else {
            // Не определены
        }


        done(null, newPost);
    }
}

module.exports = Transformer;
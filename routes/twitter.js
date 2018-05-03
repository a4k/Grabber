// Получение записей из твиттера

const Twitter = require('twitter');


class STwitter {
    constructor() {
        this.client = new Twitter({
            consumer_key: 'fR3RAfYojaUoHRr0hjlkFq4W9',
            consumer_secret: '4uzfRPt3B9lsoT0aBPTEMDlNBbFH0mtv8MhFKi6gLvAikA5YwL',
            access_token_key: '733312957963194368-su2NwrJ7CEybpQgZaVEU8FwvghSAwCi',
            access_token_secret: 'v4zi6XUeticKYEa6FhBkFV2EvL4TSblMkFvGHnTLU8MX0'
        });
        // this.request();
    }

    getPosts(search_text, callback) {
        // Получение записей
        let $this = this,
            max_page = 2; // максимальное число страниц
        const postG = (next_from, k, postsArray, cb) => {
            new Promise((resolve, reject) => {
                this.client.get('search/tweets', {q: search_text, count: 10, max_id: next_from}, function (err, tweets, response) {
                    if (err) reject(err);
                    // console.log(tweets.statuses);
                    resolve({posts : tweets.statuses, max_id : tweets.id});
                });
            }).then((msg) => {
                // Получаем комментарии
                postsArray = postsArray.concat(msg.posts);
                next_from = msg.max_id;
                if(k < max_page && msg.max_id) {
                    k++;
                    postG(next_from, k, postsArray, cb);
                } else {
                    cb(null, postsArray);
                }

                // postG(post);
            }).catch((err) => {
                cb(err);
            })
        };
        new Promise((resolve, reject) => {
            postG(0, 0, [], (err, postsArray) => {
                if(!err) {
                    resolve(postsArray);
                } else {
                    reject(err);
                }
            })

        }).then((postsArray) => {
            // Поток завершен
            callback(null, postsArray);
        }).catch((err) => {
            console.log('Поток завершен с ошибками ' + err);
            callback(err);
        });
    }

}

module.exports = STwitter;
// Получение записей из вк

const {VK} = require('vk-io');
const vk = new VK();

//https://vk.com/habr?w=wall-20629724_1064253


class SVK {
    constructor() {
        vk.setToken('fc590c97fc590c97fc590c97abfc1adc5bffc59fc590c97a684d504629b9895532bd371');
    }

    getPosts(search_text, callback) {
        // Получение записей
        let $this = this,
            max_page = 2; // максимальное число страниц
        const postG = (next_from, k, postsArray, cb) => {
            new Promise((resolve, reject) => {
                vk.api.newsfeed.search({
                    q: search_text,
                    count: 10,
                    start_from: next_from,
                }).then((msg) => {
                    // console.log(msg);
                    resolve(msg);
                });
            }).then((msg) => {
                // Получаем комментарии
                postsArray = postsArray.concat(msg.items);
                next_from = msg.next_from;
                if(k < max_page && msg.next_from) {
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

    getComments(post, callback) {
        // Получение комментариев
        let $this = this,
            max_page = 2; // максимальное число страниц
        const commentG = (k, commentsArray, cb) => {
            new Promise((resolve, reject) => {
                vk.api.wall.getComments({
                    owner_id: post.owner_id,
                    post_id: post.id,
                    need_likes: 1,
                    count: 10,
                    offset: k*1,
                }).then((msg) => {
                    resolve(msg);
                });
            }).then((msg) => {
                // Получаем комментарии
                msg.items.map((comment) => {
                    comment.owner_id = post.id;
                    return comment;
                });
                commentsArray = commentsArray.concat(msg.items);
                if(k < max_page) {
                    k++;
                    commentG(k, commentsArray, cb);
                } else {
                    cb(null, commentsArray);
                }

                // postG(post);
            }).catch((err) => {
                cb(err);
            })
        };
        new Promise((resolve, reject) => {
            commentG(0, [], (err, commentsArray) => {
                if(!err) {
                    resolve(commentsArray);
                } else {
                    reject(err);
                }
            })

        }).then((commentsArray) => {
            // Поток завершен
            callback(null, commentsArray);
        }).catch((err) => {
            console.log('Поток завершен с ошибками ' + err);
            callback(err);
        });
    }


    addPosts(search_text, callback) {
        // Получение записей
        let $this = this,
            groups = [-20629724],
            pArray = [],
            max_page = 2; // максимальное число страниц
        const postG = (group_id, k, postsArray, cb) => {
            new Promise((resolve, reject) => {
                if(groups[group_id]) {
                    vk.api.wall.get({
                        owner_id: Math.floor(groups[group_id]),
                        count: 5,
                        offset: k*5,
                    }).then((msg) => {
                        // console.log(msg);
                        resolve(msg);
                    }).catch((err) => {
                        cb(err);
                    });
                } else {
                    cb(null, postsArray)
                }

            }).then((msg) => {
                // Получаем комментарии
                postsArray = postsArray.concat(msg.items);
                if(k < max_page) {
                    // Переход к следующей странице записей
                    k++;
                    postG(group_id, k, postsArray, cb);
                } else {
                    if(group_id < groups.length) {
                        // Переход к следующей группе
                        group_id++;
                        k = 0;
                        postG(group_id, k, postsArray, cb);
                    } else {
                        // Возвращаем список записей

                        cb(null, postsArray);
                    }
                }

                // postG(post);
            }).catch((err) => {
                cb(err);
            })
        };
        new Promise((resolve, reject) => {
            let PostsFromGroups = [];
            postG(0, 0, [], (err, postsArray) => {
                if(!err) {
                    resolve(postsArray);
                } else {
                    reject(err);
                }
            });

        }).then((postsArray) => {
            // Поток завершен
            callback(null, postsArray);
        }).catch((err) => {
            console.log('Поток завершен с ошибками ' + err);
            callback(err);
        });
    }
}

module.exports = SVK;
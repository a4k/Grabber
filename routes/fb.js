// Получение записей из твиттера

const options = {
    appSecret: 'a7a66e3e23aa3c58c55a38c042af6146',
    appId: '220634578702624',
    // accessToken: '220634578702624|a7a66e3e23aa3c58c55a38c042af6146',
    // accessToken: 'EAACEdEose0cBAAntXM028YZBKynDL8v4ey2iZCBVWh2sD0c0apcI4yag0PHEhSdMctEa7cZBQy1MtZAHexlDQqJ4WK7VINjcCwhxEKpUwPgTqvZAXZCYAZCNZBxHEqWZAShvdGMpYZC9OycWuegj6N6yW2fZBZBKWJyNcL5G4MuQZBoopuO65n8QEIfewjXlHiPzyUTx3tEz3YZB6ykAZDZD',
    accessToken: '220634578702624|ySs0mj0X_-9Ogwhdrp8BPSTFHSw',
    version: 'v2.12'
};

// ES2015 modules
const {FB, FacebookApiException} = require('fb');

class SFB {
    constructor() {
        FB.options(options);

        // new Promise((resolve, reject) => {
        //     resolve(this.getToken());
        // }).then((token) => {
        //     // Получили токен, обновляем
        //     // FB.setAccessToken(token);
        //     options.accessToken = token;
        //     FB.options(options);
        // }).catch((err) => {
        //     console.log('При получении токена возникли ошибки ' + err);
        // });

        // FB.api('/325794294270/feed', {fields: 'id, name'}, function(response) {
        //     console.log(response);
        // });
        //
        // this.request();
    }

    getToken() {
        // Получить маркер приложения
        FB.api('/oauth/access_token', {
            client_id: options.appId,
            client_secret: options.appSecret,
            grant_type: 'client_credentials',
        }, (res) => {
            console.log(res);
            if(!res || res.error) {
                console.log(!res ? 'Возникли ошибки' : res.error);
                return false;
            } else {
                return res.access_token;
            }
        });
    }

    getPosts(search_text, callback) {
        // Получение записей

        // 325794294270_10156715585334271/comments?summary=1&filter=toplevel
        // 325794294270_10156715316329271/comments?pretty=0&summary=1&filter=toplevel&limit=20&before=MTY1
        // 325794294270/feed?fields=description,name,id,created_time,message,shares,comments
        // 325794294270_10156715585334271/likes?summary=1

        let $this = this,
            groups = [325794294270, 39308306599, 159564110726533, 190542150967819,
                569814646503137, 490274341163242],
            pArray = [],
            max_page = 2; // максимальное число страниц
        const postG = (group_id, next_from, k, postsArray, cb) => {
            new Promise((resolve, reject) => {
                if(groups[group_id]) {
                    FB.api('/' + groups[group_id] + '/feed', {
                        limit: 20,
                        after: next_from,
                        fields: 'description,name,id,created_time,message,shares'
                    }, function(response) {
                        pArray = response.data;
                        console.log(response.error);
                        Promise.all(pArray.map((post, i) => {
                            // Получаем лайки у поста
                            FB.api('/' + post.id + '/comments', {
                                summary: 1,
                            }, function(response) {
                                post.comments = {
                                    count: response.summary.total_count
                                };
                            });
                            FB.api('/' + post.id + '/likes', {
                                summary: 1,
                            }, function(response) {
                                post.likes = {
                                    count: response.summary.total_count
                                };
                                return post;
                            });

                        })).then((posts) => {
                            resolve({posts: response.data, max_id: response.paging.cursors.after})
                        }).catch((err) => {
                            reject(err);
                        });


                    });
                } else {
                    cb(null, postsArray)
                }

            }).then((msg) => {
                // Получаем комментарии
                postsArray = postsArray.concat(msg.posts);
                next_from = msg.max_id;

                if(k < max_page && msg.max_id) {
                    k++;
                    postG(group_id, next_from, k, postsArray, cb);
                } else {
                    if(group_id < groups.length) {
                        group_id++;
                        k = 0;
                        postG(group_id, next_from, k, postsArray, cb);
                    } else {
                        cb(null, postsArray);
                    }
                }

                // postG(post);
            }).catch((err) => {
                cb(err);
            })
        };
        new Promise((resolve, reject) => {
            postG(0, 0, 0, [], (err, postsArray) => {
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

    getComments(post, callback) {
        // Получение комментариев
        let $this = this,
            pArray = [],
            max_page = 2; // максимальное число страниц
        const postG = (next_from, k, postsArray, cb) => {
            new Promise((resolve, reject) => {
                FB.api('/' + post.id + '/comments', {
                    pretty: 0,
                    summary: 1,
                    filter: 'toplevel',
                    limit: 20,
                    after: next_from,
                }, function(response) {
                    pArray = response.data;
                    Promise.all(pArray.map((comment, i) => {
                        comment.owner_id = post.id;
                        // Получаем лайки у поста
                        FB.api('/' + comment.id + '/likes', {
                            summary: 1,
                        }, function(response) {
                            comment.likes = {count: response.summary.total_count};
                            return comment;
                        });

                    })).then((posts) => {
                        resolve({posts: response.data, max_id: response.paging.cursors.after})
                    }).catch((err) => {
                        reject(err);
                    });

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

module.exports = SFB;
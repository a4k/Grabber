const express = require('express');
const router = express.Router();


const Sender = require('../routes/readable');
const $Sender = new Sender();
const STwitter = require('../routes/twitter');
const SVK = require('../routes/vk');
const SFB = require('../routes/fb');
const DB = require('../routes/db');
const $DB = new DB();
const ElasticSearch = require('../routes/elasticsearch');
const $Elastic = new ElasticSearch();

/* GET home page. */
router.get('/', function(req, res, next) {
    /*
    $DB.getPosts((posts) => {
            // Получили все записи, перебрасываем в Elastic
            // console.log(posts);
            // console.log('posts :: ' + posts.length);
            // $Elastic.addPosts(posts, (msg) => {
            //         console.log("@bulk success", JSON.stringify(msg, null, "\t"));
            //         console.log(msg.length);
            //         res.send(JSON.stringify(msg, null, "\t"));
            //     });
            //     console.log(posts)
            }
        );
        */
    // $Elastic.searchItem();
  res.render('index', { title: 'Анализ общественного мнения' });
});

// Поиск
router.post('/search', (req, res) => {
    let $Twitter = new STwitter(),
        $VK = new SVK(),
        $FB = new SFB(),
        search_text = req.body.search_text;

if(search_text) {


    new Promise((resolve, reject) => {
        // Обрабатываем соц. сети
        /*$Twitter.getPosts(search_text, (err, postsArray) => {
            // Получить записи из твиттера по запросу
            if(!err) {
                $Sender.splitOnChunks(postsArray, (chunks) => {
                    // Разделить на чанки
                    $Sender.fetchAllChunks(chunks, {soc_type: 'twitter', type: 'post'}, (errors, msg) => {
                        // Запись завершена
                        if(errors) {
                            // Поток завершен с ошибками
                            reject(errors);
                        } else {
                            // Поток завершен
                            resolve(msg);
                        }
                    });
                });
            } else {
                console.log('Возникла ошибка ' + err);
            }
        });*/
        resolve('test');
    }).then((tweets) => {
        console.log('Поток с твиттером завершен');
        // Здесь цепочкой вызываем следующую соц. сеть
        // return возвращаем посты

        /*return new Promise((resolve, reject) => {
            $VK.addPosts(search_text, (err, postsArray) => {
                if (!err) {
                    $Sender.splitOnChunks(postsArray, (chunks) => {
                        // Разделить на чанки
                        $Sender.fetchAllChunks(chunks, {soc_type: 'vk', type: 'post'}, (errors, msg) => {
                            // Запись завершена
                            if (errors) {
                                // Поток завершен с ошибками
                                reject(errors);
                            } else {
                                // Поток завершен
                                resolve(msg);
                            }
                        });
                    });
                } else {
                    console.log('Возникла ошибка ' + err);
                }
            });
        }).then((postsArray) => {
            return postsArray;
        }).catch((err) => {
            console.log(err);
            return false;
        });*/

        /*return new Promise((resolve, reject) => {
            $VK.getPosts(search_text, (err, postsArray) => {
                if(!err) {
                    $Sender.splitOnChunks(postsArray, (chunks) => {
                        // Разделить на чанки
                        $Sender.fetchAllChunks(chunks, {soc_type: 'vk', type: 'post'}, (errors, msg) => {
                            // Запись завершена
                            if(errors) {
                                // Поток завершен с ошибками
                                reject(errors);
                            } else {
                                // Поток завершен
                                resolve(msg);
                            }
                        });
                    });
                } else {
                    console.log('Возникла ошибка ' + err);
                }
            });
        }).then((postsArray) => {
            return postsArray;
        }).catch((err) => {
            console.log(err);
        })*/
        return true;

    }).then((msg) => {
        console.log('Поток с VK завершен');
        // Отправляем запрос на сайт
        // res.send({'type' : 'success'});
        /*return new Promise((resolve, reject) => {
            $FB.getPosts(search_text, (err, postsArray) => {
                if(!err) {
                    $Sender.splitOnChunks(postsArray, (chunks) => {
                        // Разделить на чанки
                        $Sender.fetchAllChunks(chunks, {soc_type: 'fb', type: 'post'}, (errors, msg) => {
                            // Запись завершена
                            if(errors) {
                                // Поток завершен с ошибками
                                reject(errors);
                            } else {
                                // Поток завершен
                                resolve(msg);
                            }
                        });
                    });
                } else {
                    console.log('Возникла ошибка ' + err);
                }
            });
        }).then((postsArray) => {
            return postsArray;
        }).catch((err) => {
            console.log(err);
        });*/
        return true;
    }).then((msg) => {
        console.log('Поток с FB завершен');
        if (!msg) {
            console.log('Ошибка: данные не найдены');
        }
        // $DB.getPosts((posts) => {
        //         // Получили все записи, перебрасываем в Elastic
        //         $Elastic.addPosts(posts, (msg) => {
        //             console.log("@bulk success", JSON.stringify(msg, null, "\t"));
        //              res.send(JSON.stringify(msg, null, "\t"));
        //         });
        //         // console.log(posts)
        //     }
        // );
    }).catch((err) => {
        if (err) {
            console.log('При обработке соц. сетей возникли ошибки ' + err);
        }
    });
}

});

module.exports = router;

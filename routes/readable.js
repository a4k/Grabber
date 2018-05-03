'use strict';
const { Readable } = require('stream');
const Transformer = require('../routes/transform.js');
const Writer = require('../routes/writable.js');
const DB = require('../routes/db.js');
const SVK = require('../routes/vk');
const $DB = new DB();
let $VK = new SVK();

let opts = {
    objectMode: true,
    highWaterMark: 20,
}, t_opts = {
    readableObjectMode: true,
    objectMode: true,
}, w_opts = {
    objectMode: true,
    highWaterMark: 20,
};


// Получаем посты по несколько штук
class PostsChunk extends Readable
{
    constructor(postsArray = [], opt = {})
    {
        super(opt);
        this.postsArray = postsArray;

        //для краткости примеров, добавим обработчики событий в конструкторе
        this.on('data', (chunk)=>
        {
            // console.log(`chunk = ${chunk}`);
        })
            .on('error',(err)=>
            {
                console.log('Возникла ошибка ', err);
            })
            .on('end',()=>
            {
                // end
            });
    }
    _read()
    {
        let data = this.postsArray.shift();
        if (!data) {
            //сообщаем, что данные закончились
            this.push(null);
        } else {
            this.push(data);
        }
    }
}

// Обработка поста отдельно
class Posts extends Readable {
    constructor(postsArray = [], opt = []) {
        super(opt);
        this.postsArray = postsArray;

        this.on('data', (chunk) => {
            // получили данные, обрабатываем
            // console.log('post '+chunk)
        }).on('error', () => {
            // Возникла ошибка

        }).on('end', () => {
            // Данные закончились

        })
    }
    _read() {
        let data = this.postsArray.shift();
        if(!data) {
            this.push(null);
        } else {
           this.push(data);
        }
    }
}

// Отправление данных в поток
class Sender {
    splitOnChunks(postsArray = [], callback) {
        // Разделение массива на части
        let postsArray2 = [];

        Promise.all(postsArray.map((post, index) => {
            if((index+1)%(opts.highWaterMark) === 1) {
                // send on stream
                postsArray2.push(postsArray.slice(index, index+opts.highWaterMark));
                return postsArray.slice(index, index+opts.highWaterMark);
            }
            return post;
        })).then((a) => {
            // Добавить записи
            callback(postsArray2);
        });
    }
    fetchAllChunks(postsArray = [], info, callback) {
        // Отправление чанка из нескольких постов
        const R = new PostsChunk(postsArray, opts);
        let $this = this;
        R.on('data', (chunk) => {
            // Обрабатываем полученный чанк
            $this.fetchChunk(chunk, info, R, callback);

        });
    }
    fetchChunk(postsArray = [], info, R2, callback) {
        // Отправление поста на обработку
        const R = new Posts(postsArray, opts);
        const T = new Transformer({soc_type: info.soc_type, type: info.type}, t_opts);
        const W = new Writer({soc_type: info.soc_type, type: info.type}, w_opts);
        let r_end = false, $this = this;
        R2.pause();
        R.pipe(T).pipe(W);
        // R.pipe(T);

        W.on('finish', () => {
            // Данные успешно сохранены в DataBase
            console.log('Записано в DataBase\n');
            R2.resume();
            if(r_end) {
                // Поток завершен
                callback(null, true); // null - ошибок не найдено
            }

        });

        R2.on('error', (err) => {
            callback(true, err);
        }).on('end', () => {
            // Чтение всего потока завершено
            r_end = true;
        });

        R.on('data', (post) => {
            // Обработка комментариев поста
            if (info.type === 'comments') {
                // console.log(post);
            }

            if(info.type !== 'comments' && info.soc_type === 'vk' && post.comments.count > 0) {
                // есть комментарии
                R.pause();
                $VK.getComments(post, (err, postsArray) => {
                    // Получить записи из VK по запросу
                    if(!err) {
                        $this.splitOnChunks(postsArray, (chunks) => {
                            // Разделить на чанки
                            $this.fetchAllChunks(chunks, {soc_type: 'vk', type: 'comments'}, (errors, msg) => {
                                // Запись завершена
                                if(errors) {
                                    // Поток завершен с ошибками
                                    console.log('Возникла ошибка ' + errors);

                                } else {
                                    // Поток завершен
                                    R.resume();
                                }
                            });
                        });
                    } else {
                        console.log('Возникла ошибка ' + err);
                    }
                });
            }
            if(info.type !== 'comments' && info.soc_type === 'fb') {
                // есть комментарии
                R.pause();
                $FB.getComments(post, (err, postsArray) => {
                    // Получить записи из VK по запросу
                    if(!err) {
                        $this.splitOnChunks(postsArray, (chunks) => {
                            // Разделить на чанки
                            $this.fetchAllChunks(chunks, {soc_type: 'fb', type: 'comments'}, (errors, msg) => {
                                // Запись завершена
                                if(errors) {
                                    // Поток завершен с ошибками
                                    console.log('Возникла ошибка ' + errors);

                                } else {
                                    // Поток завершен
                                    R.resume();
                                }
                            });
                        });
                    } else {
                        console.log('Возникла ошибка ' + err);
                    }
                });
            }
            // R.pause();
        }).on('end', () => {
            // Чтение чанка завершено
            // console.log('\nend of chunk');
            if(info.type === 'comments') {
                callback(null, true);
            }
        });
    }
}

module.exports = Sender;



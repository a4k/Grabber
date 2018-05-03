'use strict';
const {Writable} = require('stream');
const DB = require('../routes/db.js');
const $DB = new DB();


// Добавление данных в DataBase
class Writer extends Writable {
    constructor(info = {}, opt = {}) {
        super(opt);
        this.info = info;

        this.on('error', (err) => {
            console.log('Возникла ошибка ', err);
        }).on('drain', () => {
            // console.log('drain');
        }).on('finish', () => {
            // console.log('finish');
        });

    }

    _write(post, encoding, done) {
        // Записываем данные в DataBase

        $DB.savePost(post, this.info, (savedPost) => {
            if(savedPost === false) {
                // есть не сохраненные записи
                done(new Error('Запись не сохранена'));
            } else {
                // все записи сохранены
                console.log(savedPost);
                done();
            }
        });
    }
}

module.exports = Writer;
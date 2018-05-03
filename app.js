const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');


const Sender = require('./routes/readable');
const $Sender = new Sender();
const STwitter = require('./routes/twitter');
const SVK = require('./routes/vk');
const SFB = require('./routes/fb');


const indexRouter = require('./routes/index');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);




// main code




// let $Twitter = new STwitter(),
//     $VK = new SVK(),
//     $FB = new SFB(),
//     search_text = 'путин';



/*
new Promise((resolve, reject) => {
    // Обрабатываем соц. сети
    $Twitter.getPosts(search_text, (err, postsArray) => {
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
    });
}).then((tweets) => {
    console.log('Поток с твиттером завершен');
    // Здесь цепочкой вызываем следующую соц. сеть
    // return возвращаем посты

    return new Promise((resolve, reject) => {
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
    })

}).then((msg) => {
    console.log('Поток с VK завершен');
    if(!msg) {
        console.log('Ошибка: данные не найдены');
    }
}).catch((err) => {
    if(err) {
        console.log('При обработке соц. сетей возникли ошибки ' + err);
    }
});
*/



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});






function isConsole(a = 'test') {
  console.log(a)
}
module.exports = app;

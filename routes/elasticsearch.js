// app and authentication configurations
const HOST_URL = "https://scalr.api.appbase.io";
const APPNAME = "grabber";
// const CREDENTIALS = "3Id6WEolQ:80ed6637-ab1f-4923-8dba-b53c0c5e2520";
const CREDENTIALS = "ssZWKbXHQ:21280765-d1f4-427e-a771-873abaad2eec";

// Add data into our ES "app index"
const Appbase = require("appbase-js");
const appbase = new Appbase({
    url: HOST_URL,
    app: APPNAME,
    credentials: CREDENTIALS
});

class ElasticSearch {
    constructor() {

    }
    addPosts(posts, callback) {
        // Добавляем все записи

        appbase.bulk({
            type: 'posts',
            body: posts
        }).on('data', (msg) => {
            callback(null, msg);
        }).on('error', (err) => {
            callback(err);
        })
    }
    addItem() {
        // Добавление в Elastic Search
        appbase.index({
            type: "product",
            id: "1",
            body: {
                name: "A green door",
                price: 12.50,
                tags: ["home", "green"],
                stores: ["Walmart", "Target"]
            }
        }).on("data", function(res) {
            console.log(res);
        }).on("error", function(err) {
            console.log(err);
        });
    }

    getItems() {
        appbase.get({
            type: "product",
            id: 1,
        }).on('data', function(res) {
            console.log(res)
        })
    }

    searchItem() {
        // Поиск в Elastic Search
        let settings = {
            "index":{
                "analysis":{
                    "analyzer":{
                        "inurl_analyzer": {
                            "tokenizer":"ngram",
                            "filter":"lowercase"
                        }
                    },
                    "tokenizer":{
                        "ngram": {
                            "type": "ngram",
                            "min_gram": 3,
                            "max_gram": 50
                        }
                    }
                }
            }
        };
        appbase.search({
            type: "posts",
            body: {
                query: {
                    match: {
                        _all: "Рома"
                    }
                }
            }
        }).on('data', function(res) {
            console.log(res.hits.hits)
        })
    }
}

module.exports = ElasticSearch;
var express = require("express");
var exphbs = require("express-handlebars");
var mongojs = require("mongojs");
var cheerio = require("cheerio");
var request = require("request");
var app = express();
var databaseUrl = "articles";
var collections = ["scrapedArticles"];
var path = require("path");
var PORT = process.env.PORT || 3000;

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
    console.log("Database Error:", error);
});

app.engine("handlebars", exphbs({ 
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, 'views'));

app.get("/", function(req, res) {
    db.scrapedArticles.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }
        else {
            console.log(found);
            res.render("index", found);
        }
    });
});

app.get("/scrape", function (req, res) {
    request("https://old.reddit.com/r/TheOnion/", function(error, response, html) {
        var $ = cheerio.load(html);

    $("p.title").each(function(i, element) {
        var title = $(element).text();
        var link = $(element).children().attr("href");

        if (title && link) {
            db.scrapedArticles.insert({
                title: title,
                link: link,
            },
        function(err, inserted) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(inserted);
            }
        });
        }     
    });
});
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});
  


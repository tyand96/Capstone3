import express from "express";
import bodyParser from "body-parser";
import {fileURLToPath} from "url";
import {dirname} from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

let blogPosts = [];

class BlogPost {
    constructor(title, content, photoUrl, author, date) {
        this.title = title;
        this.content = content;
        this.photoUrl = photoUrl;
        this.author = author;
        this.date = date;
    }
}

const app = express();
const port = 3000;

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
    res.render("index.ejs");
});





app.listen(port, () => {
    console.log(`Starting server on port ${port}.`);
});
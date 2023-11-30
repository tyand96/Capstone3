import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import {fileURLToPath} from "url";
import {dirname, extname} from "path";
import {Buffer} from "buffer";
const __dirname = dirname(fileURLToPath(import.meta.url));

let blogPosts = [];
let error = null;

class BlogPost {
    constructor(title, content, photoUrl, author, date) {
        this.title = title;
        this.content = content;
        this.photoUrl = photoUrl;
        this.author = author;
        this.date = date;
    }
}

function fileFilter(req, file, callback) {
    const ext = extname(file.originalname);
    if (ext !== '.png' && ext !== ".jpg" && ext !== ".jpeg") {
        return callback(new Error("Only images are allowed!"));
    }
    callback(null, true);
}

const app = express();
const port = 3000;
const storage = multer.memoryStorage();
const upload = multer({storage: storage, fileFilter: fileFilter});

function allFieldsValid(req) {
    console.log(req.body);
    console.log(req.file);
}

function bufferToImgSource(imgData) {
    const imgBuffer = imgData.buffer.toString("base64");
    const imgSource = `data:${imgData.mimetype};base64,${imgBuffer}`;
    return imgSource;
}

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
    res.render("index.ejs", {error: error});
});

app.post("/submit", (req, res) => {
    upload.single("blogImg")(req, res, function(err) {
        if (err) {
            console.log(err.name, err.message);
            error = err.message;
            res.redirect("/");
        } else if (!req.file) {
            error = "A file must be selected!";
            res.redirect("/");
        } else {
            error = null;
            res.sendStatus(201);
        }
    })
})




app.listen(port, () => {
    console.log(`Starting server on port ${port}.`);
});
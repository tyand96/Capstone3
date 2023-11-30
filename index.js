import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import {fileURLToPath} from "url";
import {dirname, extname} from "path";
import {Buffer} from "buffer";
import { buffer } from "stream/consumers";
const __dirname = dirname(fileURLToPath(import.meta.url));

const BlogErrorLocations = {
    TITLE: "title",
    CONTENT: "content",
    IMAGE: "image",
    AUTHOR: "author"
}

class BlogError extends Error {
    constructor(location, message) {
        super(message);
        this.location = location;
    }
}

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
        return callback(new BlogError(BlogErrorLocations.IMAGE, "Only images are allowed!"));
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
    const body = req.body;

    // No need to check the file because this has already been checked.
    if (!body.blogTitle) {
        return new BlogError(BlogErrorLocations.TITLE, "A title must be specified!");
    } else if (!body.blogAuthor) {
        return new BlogError(BlogErrorLocations.AUTHOR, "An author must be specified!");
    } else if (!body.blogContent) {
        return new BlogError(BlogErrorLocations.CONTENT, "There must be some content to the blog post!");
    }

    // Everything was specified.
    return null;

}

function bufferToImgSource(imgData) {
    const imgBuffer = imgData.buffer.toString("base64");
    const imgSource = `data:${imgData.mimetype};base64,${imgBuffer}`;
    return imgSource;
}

function createBlogPost(reqBody, reqFile) {
    blogPosts.push(new BlogPost(
        reqBody.blogTitle,
        reqBody.blogContent,
        bufferToImgSource(reqFile.buffer),
        reqBody.blogAuthor,
        new Date()
    ))
}

app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
    const errorMessage = error ? error.message : null;
    res.render("index.ejs", {error: error});
});

app.post("/submit", (req, res) => {
    upload.single("blogImg")(req, res, function(err) {
        
        // An error with Multer.
        if (err instanceof multer.MulterError) {
            console.log(err);
            res.redirect(500, "/");

        // An error with the type of file.
        } else if (err) {
            console.log(err.name, err.message);
            error = err;
            res.redirect("/");

        // An error that the user did not select a file.
        } else if (!req.file) {
            error = new BlogError(BlogErrorLocations.IMAGE, "A file must be selected!");
            res.redirect("/");

        // Everything was fine.
        } else {
            // Make sure the other fields were valid.
            error = allFieldsValid(req);
            if (error) {
                res.redirect("/");

            // Now, create the blog post.
            } else {
                createBlogPost(req.body, req.file);
                console.log(blogPosts);
                res.sendStatus(201);
            }
        }
    })
})




app.listen(port, () => {
    console.log(`Starting server on port ${port}.`);
});
const express = require("express");
const bodyParser = require("boody-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");
import path from "path";
import {fileURLPath} from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import {register} from "./controler/auth.js";
import {createPost} from "./controller/posts.js";
import { verifyToken } from "./middleware/auth.js";

// Configurations

const __filename = fileURLTopath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy : "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb" , extended : true}));
app.use(bodyParser.urlencoded({limit:"30mb" , extended : true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname , 'public/assets')));


//FILE Storage


const Storage = multer.diskStorage({
    destination: function(req,file,cb)
    {
        cb(null,"public/assets");
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage});

// Routes with Files
app.post("/auth/register",upload.single("picture"),register);
app.post("/posts", verifyToken ,upload.single("picture"), createPost );

//Other Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);


//Database setup - Using MongoDB

const PORT = process.env.PORT || 6001;

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser : true,
    useUnifiedTopology: true,

}).then(()=>{
    app.listen(PORT ,()=> console.log(`Server Port: ${PORT}`));
    }).catch((error) => console.log(`${error} did not connect`));

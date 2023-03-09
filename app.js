const express = require("express");
const cors = require("cors");
const product = require("./controller/product");
const user = require("./controller/user");
const UserModel = require("./models/user");
const footer = require("./controller/footer");
const home = require("./controller/home");
const order = require("./controller/order");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const path = require("path");
const bodyParser = require("body-parser");
const io = require("./utilities/socket");

const store = new MongoDBStore({
  uri: "mongodb+srv://root:okyouwin11@cluster0.skuqtts.mongodb.net/shop?retryWrites=true&w=majority",
  collection: "session",
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const whitelist = ["http://localhost:3000", "http://localhost:3001"];
const corsOptions = {
  origin: whitelist,
  methods: ["POST", "GET", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

sessionMiddleware = session({
  secret:
    "h79fadsfj6j69df6d9df8f8hsd0fgsd0f8sdfg6dfg5df9sh7d0gj8fg7hadf6gsd8f6gsd8f69sdh6sd87f6gdf5a94k4k4k4k4k",
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true,
  },
});

app.use(sessionMiddleware);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cookieParser());

const onlineUser = [];

app.use("/user", user);
app.use("/product", product);
app.use("/footer", footer);
app.use("/home", home);
app.use("/order", order);

app.use((error, req, res, next) => {
  res.status(500).send("<h1>Something went wrong!!!!</h1>");
});

io.init(app.listen(5000));
io.getIO().engine.use(sessionMiddleware);
io.getIO().on("connection", (socket) => {
  let email;
  socket.on("start", (arg) => {
    if (arg) {
      socket.join(arg);
      onlineUser.push(arg);
      email = arg;
      UserModel.getChat(email, (value) => {
        io.getIO().to(email).emit("chat", value.chat);
      });
      io.getIO().emit("useronline", onlineUser);
    } else {
      socket.emit("chat", [
        { isAdmin: true, message: "Please login to chat with supporter!!" },
      ]);
    }
  });
  socket.on("adminJoin", (emailUser) => {
    if (
      socket.request.session.user?.role === "admin" ||
      socket.request.session.user?.role === "support"
    ) {
      socket.join(emailUser);
      UserModel.getChat(emailUser, (value) => {
        io.getIO().to(email).emit("adminGetUserChat", value.chat);
      });
      email = emailUser;
    } else {
      io.getIO().emit("conversation", [
        { isAdmin: true, message: "Only Admin or Support can access!" },
      ]);
    }
  });
  socket.on("getUserOnline", (value) => {
    if (
      socket.request.session.user?.role === "admin" ||
      socket.request.session.user?.role === "support"
    ) {
      io.getIO().emit("useronline", onlineUser);
    } else {
      io.getIO().emit("conversation", [
        { isAdmin: true, message: "Only Admin or Support can access!" },
      ]);
    }
  });
  socket.on("disconnect", (reason) => {
    const index = onlineUser.findIndex((x) => {
      return x === email;
    });
    if (index !== -1) {
      onlineUser.splice(index, 1);
    }
    io.getIO().emit("useronline", onlineUser);
  });
  socket.on("stopChat", (reason) => {
    const index = onlineUser.findIndex((x) => {
      return x === email;
    });
    if (index !== -1) {
      onlineUser.splice(index, 1);
    }
    io.getIO().emit("useronline", onlineUser);
  });
  socket.on("send", (arg) => {
    UserModel.addChat(email, arg, (value) => {
      io.getIO().to(email).emit("conversation", value.chat);
    });
  });
});

//sendinblue
//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

//mongodb
//mongodb+srv://root:okyouwin11@cluster0.skuqtts.mongodb.net/shop?retryWrites=true&w=majority

//["https://admin.ngh.one", "https://apple.ngh.one"]

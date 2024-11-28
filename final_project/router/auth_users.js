const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// 验证用户名是否有效（用户名是否未被注册）
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

// 验证用户名和密码是否匹配
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// 注册新用户
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "用户名和密码不能为空" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "用户名已存在" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "用户注册成功" });
});

// 用户登录
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "用户名和密码不能为空" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "用户名或密码错误" });
  }

  const accessToken = jwt.sign(
    { username },
    "your_jwt_secret",
    { expiresIn: "1h" }
  );

  return res.status(200).json({ message: "登录成功", token: accessToken });
});

// 添加或修改书籍评论
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user?.username;

  if (!review) {
    return res.status(400).json({ message: "评论内容不能为空" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "未找到对应的书籍" });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "评论已成功添加或更新",
    reviews: books[isbn].reviews,
  });
});

// 删除书籍评论
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "未找到对应的书籍" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "未找到您的评论" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: "评论已成功删除",
    reviews: books[isbn].reviews,
  });
});

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "缺少访问令牌" });
  }

  const accessToken = token.split(" ")[1];
  jwt.verify(accessToken, "your_jwt_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "访问令牌无效或已过期" });
    }
    req.user = user;
    next();
  });
};

regd_users.use("/auth/review/:isbn", authenticateToken);

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

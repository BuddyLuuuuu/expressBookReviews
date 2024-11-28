const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// JWT 认证中间件
app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.headers["authorization"]; // 获取 Authorization 头部
  if (!token) {
    return res.status(401).json({ message: "缺少访问令牌" });
  }

  const accessToken = token.split(" ")[1]; // 提取 Bearer 后的实际 Token
  jwt.verify(accessToken, "your_jwt_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "访问令牌无效或已过期" });
    }
    req.user = user; // 将用户名附加到请求对象
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port", PORT));

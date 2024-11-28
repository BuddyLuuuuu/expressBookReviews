const express = require('express');
let books = require("./booksdb.js"); // 引用本地书籍数据
const public_users = express.Router();

// 获取书籍列表
async function getBooksAsync() {
    try {
        return books; // 直接返回本地数据
    } catch (error) {
        throw error;
    }
}

public_users.get('/', async (req, res) => {
    try {
        console.log("Fetching books list...");
        const booksList = await getBooksAsync();
        res.status(200).json(booksList);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "获取书籍列表失败", error });
    }
});

// 获取书籍详情 (根据 ISBN)
async function getBookByIsbnAsync(isbn) {
    try {
        if (books[isbn]) {
            return books[isbn]; // 从本地书籍数据中获取
        } else {
            throw new Error("未找到对应的书籍");
        }
    } catch (error) {
        throw error;
    }
}

public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByIsbnAsync(isbn);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: "未找到对应的书籍", error });
    }
});

// 获取书籍详情 (根据作者)
async function getBooksByAuthorAsync(author) {
    try {
        const authorBooks = Object.values(books).filter(book => book.author === author);
        if (authorBooks.length > 0) {
            return authorBooks;
        } else {
            throw new Error("未找到该作者的书籍");
        }
    } catch (error) {
        throw error;
    }
}

public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthorAsync(author);
        res.status(200).json(booksByAuthor);
    } catch (error) {
        res.status(404).json({ message: "未找到该作者的书籍", error });
    }
});

// 获取书籍详情 (根据书名)
async function getBooksByTitleAsync(title) {
    try {
        const titleBooks = Object.values(books).filter(book => book.title === title);
        if (titleBooks.length > 0) {
            return titleBooks;
        } else {
            throw new Error("未找到该书名的书籍");
        }
    } catch (error) {
        throw error;
    }
}

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitleAsync(title);
        res.status(200).json(booksByTitle);
    } catch (error) {
        res.status(404).json({ message: "未找到该书名的书籍", error });
    }
});

// 获取书籍评论
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        if (books[isbn] && books[isbn].reviews) {
            res.status(200).json(books[isbn].reviews);
        } else {
            throw new Error("未找到该书籍的评论");
        }
    } catch (error) {
        res.status(404).json({ message: "未找到该书籍的评论", error });
    }
});

module.exports.general = public_users;

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username && !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (!username) {
    return res.status(400).json({message: "Username is required"});
  }
  if (!password) {
    return res.status(400).json({message: "Password is required"});
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({message: `User ${username} already exists`});
  }

  users.push({ username, password });
  return res.status(200).json({message: `User ${username} successfully registered. Now you can login`});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }
  return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.keys(books)
    .filter(isbn => books[isbn].author === author)
    .map(isbn => ({ isbn, ...books[isbn] }));
  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  }
  return res.status(404).json({message: `No books found by author ${author}`});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.keys(books)
    .filter(isbn => books[isbn].title === title)
    .map(isbn => ({ isbn, ...books[isbn] }));
  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  }
  return res.status(404).json({message: `No books found with title ${title}`});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
});

module.exports.general = public_users;

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";


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

// Task 10: Get the book list available in the shop using async-await with Axios
const getAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

public_users.get('/async/books', async function (req, res) {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error fetching book list", error: error.message});
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
const getBookByIsbn = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then(response => response.data);
};

public_users.get('/async/isbn/:isbn', function (req, res) {
  getBookByIsbn(req.params.isbn)
    .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch(error => {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({message: "Error fetching book details", error: error.message});
    });
});

// Task 12: Get book details based on author using async-await with Axios
const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

public_users.get('/async/author/:author', async function (req, res) {
  try {
    const booksByAuthor = await getBooksByAuthor(req.params.author);
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({message: "Error fetching books by author", error: error.message});
  }
});

module.exports.general = public_users;

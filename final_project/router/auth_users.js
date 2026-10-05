const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({message: "Invalid login. Check username and password"});
  }

  // Sign a JWT and store it in the session for the auth middleware in index.js
  const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({message: `User ${username} successfully logged in`});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }
  if (!review) {
    return res.status(400).json({message: "Review is required as a query parameter"});
  }

  // Reviews are keyed by username, so a repeat post from the same user overwrites theirs
  const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
  book.reviews[username] = review;

  return res.status(200).json({
    message: `Review for ISBN ${isbn} ${isUpdate ? "updated" : "added"} by ${username}`,
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }

  // Only the session user's own review can be deleted
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({message: `No review by ${username} found for ISBN ${isbn}`});
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} deleted by ${username}`,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

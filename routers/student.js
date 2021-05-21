const express = require('express');
const StudentController = require('../controllers/student');

const api = express.Router();

api.post('/add-student', StudentController.addStudent);

module.exports = api;

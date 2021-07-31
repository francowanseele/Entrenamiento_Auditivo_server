const express = require('express');
const InstituteController = require('../controllers/institute');

const api = express.Router();

api.put('/add-institute', InstituteController.addInstitute);
api.put('/add-course-institute/:id', InstituteController.addCourse);
api.get('/get-institute', InstituteController.getInstitute);
api.get('/get-course-institute/:id', InstituteController.getCourses);

module.exports = api;

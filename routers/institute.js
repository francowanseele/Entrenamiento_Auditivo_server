const express = require('express');
const InstituteController = require('../controllers/institute');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.put('/add-institute', InstituteController.addInstitute);
api.put('/add-course-institute/:id', InstituteController.addCourse);
api.get('/get-institute', [md_auth.ensureAuth], InstituteController.getInstitute);
api.get('/get-course-institute/:id', InstituteController.getCourses);
api.get('/get-institute-by-user', InstituteController.getInstituteByUser);

module.exports = api;

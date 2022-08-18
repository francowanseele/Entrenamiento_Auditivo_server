const express = require('express');
const InstituteController = require('../controllers/institute');
const md_auth = require('../middleware/authenticated');

const api = express.Router();

api.put('/add-institute', [md_auth.ensureAuth], InstituteController.addInstitute);
api.put('/add-course-institute/:id', [md_auth.ensureAuth], InstituteController.addCourse);
api.get('/get-institute', [md_auth.ensureAuth], InstituteController.getInstitute);
api.get('/get-course-institute/:id', [md_auth.ensureAuth], InstituteController.getCourses);
api.get('/get-institute-by-user', [md_auth.ensureAuth], InstituteController.getInstituteByUser);

module.exports = api;

import { Router } from 'express';
import {
  getUniversities, createUniversity,
  getColleges, createCollege,
  getDepartments, createDepartment,
  getMajors, createMajor,
  getLevels, createLevel,
  getSubjects, createSubject
} from '../controllers/academic.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only ADMIN can create academic structures
const adminOnly = [authenticate, authorize(['ADMIN'])];

// Universities
router.get('/universities', getUniversities);
router.post('/universities', adminOnly, createUniversity);

// Colleges
router.get('/colleges', getColleges);
router.post('/colleges', adminOnly, createCollege);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', adminOnly, createDepartment);
// Majors
router.get('/majors', getMajors);
router.post('/majors', adminOnly, createMajor);


// Levels
router.get('/levels', getLevels);
router.post('/levels', adminOnly, createLevel);

// Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', adminOnly, createSubject);

export default router;

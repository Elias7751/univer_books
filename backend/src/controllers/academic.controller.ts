import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ==========================================
// Universities
// ==========================================
export const getUniversities = async (req: Request, res: Response) => {
  try {
    const universities = await prisma.university.findMany({
      include: { colleges: true },
    });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching universities' });
  }
};

export const createUniversity = async (req: Request, res: Response) => {
  try {
    const { name, logoUrl } = req.body;
    const university = await prisma.university.create({
      data: { name, logoUrl },
    });
    res.status(201).json(university);
  } catch (error) {
    res.status(500).json({ message: 'Error creating university' });
  }
};

// ==========================================
// Colleges
// ==========================================
export const getColleges = async (req: Request, res: Response) => {
  try {
    const { universityId } = req.query;
    const colleges = await prisma.college.findMany({
      where: universityId ? { universityId: Number(universityId) } : undefined,
      include: { departments: true },
    });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching colleges' });
  }
};

export const createCollege = async (req: Request, res: Response) => {
  try {
    const { name, universityId } = req.body;
    const college = await prisma.college.create({
      data: { name, universityId: Number(universityId) },
    });
    res.status(201).json(college);
  } catch (error) {
    res.status(500).json({ message: 'Error creating college' });
  }
};

// ==========================================
// Departments
// ==========================================
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { collegeId } = req.query;
    const departments = await prisma.department.findMany({
      where: collegeId ? { collegeId: Number(collegeId) } : undefined,
      include: { majors: true },
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, collegeId } = req.body;
    const department = await prisma.department.create({
      data: { name, collegeId: Number(collegeId) },
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department' });
  }
};


// ==========================================
// Majors
// ==========================================
export const getMajors = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.query;
    const majors = await prisma.major.findMany({
      where: departmentId ? { departmentId: Number(departmentId) } : undefined,
      include: { levels: true },
    });
    res.json(majors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching majors' });
  }
};

export const createMajor = async (req: Request, res: Response) => {
  try {
    const { name, departmentId } = req.body;
    const major = await prisma.major.create({
      data: { name, departmentId: Number(departmentId) },
    });
    res.status(201).json(major);
  } catch (error) {
    res.status(500).json({ message: 'Error creating major' });
  }
};

// ==========================================
// Levels
// ==========================================
export const getLevels = async (req: Request, res: Response) => {
  try {
    const { majorId } = req.query;
    const levels = await prisma.level.findMany({
      where: majorId ? { majorId: Number(majorId) } : undefined,
      include: { subjects: true },
    });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels' });
  }
};

export const createLevel = async (req: Request, res: Response) => {
  try {
    const { name, majorId } = req.body;
    const level = await prisma.level.create({
      data: { name, majorId: Number(majorId) },
    });
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: 'Error creating level' });
  }
};

// ==========================================
// Subjects
// ==========================================
export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { levelId } = req.query;
    const subjects = await prisma.subject.findMany({
      where: levelId ? { levelId: Number(levelId) } : undefined,
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, levelId } = req.body;
    const subject = await prisma.subject.create({
      data: { name, levelId: Number(levelId) },
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subject' });
  }
};

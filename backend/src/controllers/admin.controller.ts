import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logActivity } from '../utils/audit';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalDocuments = await prisma.document.count();
    const approvedDocuments = await prisma.document.count({ where: { status: 'APPROVED' } });
    const pendingDocuments = await prisma.document.count({ where: { status: 'PENDING' } });
    const totalUniversities = await prisma.university.count();
    const totalColleges = await prisma.college.count();

    res.json({
      totalUsers,
      totalDocuments,
      approvedDocuments,
      pendingDocuments,
      totalUniversities,
      totalColleges,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        document: { select: { title: true, fileUrl: true } },
        reporter: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // RESOLVED or DISMISSED

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const report = await prisma.report.update({
      where: { id: Number(id) },
      data: { status },
    });

    await logActivity(req.user?.userId || null, 'REPORT_RESOLVED', `Resolved report ID ${id} with status ${status}`);

    res.json({ message: 'Report updated successfully', report });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({ message: 'Error resolving report' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs for performance
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ message: 'isActive boolean is required' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { isActive },
    });

    await logActivity(
      req.user?.userId || null, 
      isActive ? 'USER_UNBANNED' : 'USER_BANNED', 
      `${isActive ? 'Unbanned' : 'Banned'} user ID ${id} (${user.name})`
    );

    res.json({ message: `User ${isActive ? 'unbanned' : 'banned'} successfully`, user });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Error updating user status' });
  }
};

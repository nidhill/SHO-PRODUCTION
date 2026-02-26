// Mock API service for demo purposes
import type { User, Batch, Student, School, Assignment, FeedbackItem, Notification, Group, AuditLog } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@demo.com',
    role: 'sho',
    phone: '9876543210',
    assignedBatches: []
  }
];

// Mock Schools
const mockSchools: School[] = [];

// Mock Batches
const mockBatches: Batch[] = [];

// Mock Students
const mockStudents: Student[] = [];

// Mock Assignments
const mockAssignments: Assignment[] = [];

// Mock Feedback
const mockFeedback: FeedbackItem[] = [];

// Mock Notifications
const mockNotifications: Notification[] = [];

// Mock Groups
const mockGroups: Group[] = [];

// Mock Audit Logs
const mockAuditLogs: AuditLog[] = [];

const logActivity = (user: User, action: string, details: string, target?: string) => {
  mockAuditLogs.unshift({
    id: `l${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    details,
    target,
    timestamp: new Date().toISOString(),
    ip: '192.168.1.' + Math.floor(Math.random() * 255)
  });
};

// Mock Class Planner
export interface ClassPlannerItem {
  _id: string;
  batch: Batch;
  date: string;
  time: string;
  subject: string;
  topic: string;
  mentor: User;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  notes?: string;
  duration: number; // in minutes
}

const mockClassPlanner: ClassPlannerItem[] = [];

// Mock API Service
export const mockApi = {
  // Auth
  login: async (email: string, password: string) => {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password') {
      logActivity(user, 'LOGIN', 'User logged in successfully');
      return {
        data: {
          success: true,
          token: 'mock-jwt-token-' + user.id,
          user
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  getCurrentUser: async () => {
    await delay(300);
    const token = localStorage.getItem('token');
    const userId = token?.split('-').pop();
    const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
    return {
      data: {
        success: true,
        user
      }
    };
  },

  // Users Management
  getUsers: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        users: mockUsers
      }
    };
  },

  createUser: async (data: any) => {
    await delay(500);
    const newUser: User = {
      id: `${Date.now()}`,
      assignedBatches: [],
      ...data
    };
    mockUsers.push(newUser);

    const token = localStorage.getItem('token');
    const authorId = token?.split('-').pop();
    const author = mockUsers.find(u => u.id === authorId) || mockUsers[0];
    logActivity(author, 'CREATE_USER', `Created user ${newUser.name} (${newUser.role})`, newUser.id);

    return {
      data: {
        success: true,
        user: newUser
      }
    };
  },

  deleteUser: async (id: string) => {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      const deletedUser = mockUsers[index];
      mockUsers.splice(index, 1);

      const token = localStorage.getItem('token');
      const authorId = token?.split('-').pop();
      const author = mockUsers.find(u => u.id === authorId) || mockUsers[0];
      logActivity(author, 'DELETE_USER', `Deleted user ${deletedUser.name}`, deletedUser.id);

      return { data: { success: true } };
    }
    throw new Error('User not found');
  },

  getAuditLogs: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        logs: mockAuditLogs
      }
    };
  },

  // Batches
  getBatches: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        batches: mockBatches
      }
    };
  },

  getBatchAnalytics: async () => {
    await delay(300);
    return {
      data: {
        success: true,
        analytics: {
          totalBatches: mockBatches.length,
          totalStudents: mockStudents.length,
          averageAttendance: 0,
          averageFeedbackScore: 0,
          assignmentCompletionRate: 0
        }
      }
    };
  },

  getBatchStudents: async (batchId: string) => {
    await delay(300);
    return {
      data: {
        success: true,
        students: mockStudents.filter(s => s.batch._id === batchId)
      }
    };
  },

  // Students
  getStudents: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        students: mockStudents
      }
    };
  },

  getStudentAnalytics: async () => {
    await delay(300);
    return {
      data: {
        success: true,
        analytics: {
          totalStudents: mockStudents.length,
          activeStudents: mockStudents.filter(s => s.status === 'active').length,
          placedStudents: mockStudents.filter(s => s.status === 'placed').length,
          interviewRequired: mockStudents.filter(s => s.status === 'interview_required').length,
          revokedStudents: mockStudents.filter(s => s.status === 'revoked').length
        }
      }
    };
  },

  getStudentById: async (id: string) => {
    await delay(300);
    const student = mockStudents.find(s => s._id === id);
    return {
      data: {
        success: true,
        student
      }
    };
  },

  // Schools
  getSchools: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        schools: mockSchools
      }
    };
  },

  getSchoolAnalytics: async () => {
    await delay(300);
    return {
      data: {
        success: true,
        analytics: {
          totalSchools: mockSchools.length,
          totalBatches: mockBatches.length,
          totalStudents: mockStudents.length,
          schoolsList: mockSchools.map(s => ({
            id: s._id,
            name: s.name,
            totalBatches: mockBatches.filter(b => b.school._id === s._id).length,
            totalStudents: mockStudents.filter(st => st.school._id === s._id).length
          }))
        }
      }
    };
  },

  // Assignments
  getAssignments: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        assignments: mockAssignments
      }
    };
  },

  createAssignment: async (data: any) => {
    await delay(500);
    const newAssignment: Assignment = {
      _id: `a${Date.now()}`,
      ...data,
      assignedBy: mockUsers[1],
      attachments: [],
      submissions: [],
      status: 'active'
    };
    mockAssignments.push(newAssignment);
    return {
      data: {
        success: true,
        assignment: newAssignment
      }
    };
  },

  // Feedback
  getFeedback: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        feedback: mockFeedback
      }
    };
  },

  createFeedback: async (data: any) => {
    await delay(500);
    const newFeedback: FeedbackItem = {
      _id: `f${Date.now()}`,
      ...data,
      givenBy: mockUsers[0]
    };
    mockFeedback.push(newFeedback);
    return {
      data: {
        success: true,
        feedback: newFeedback
      }
    };
  },

  // Notifications
  getNotifications: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        notifications: mockNotifications
      }
    };
  },

  createNotification: async (data: any) => {
    await delay(500);
    const newNotification: Notification = {
      _id: `n${Date.now()}`,
      ...data,
      sentBy: mockUsers[0],
      readStatus: [],
      attachments: [],
      sentAt: new Date().toISOString()
    };
    mockNotifications.push(newNotification);
    return {
      data: {
        success: true,
        notification: newNotification
      }
    };
  },

  // Groups
  getGroups: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        groups: mockGroups
      }
    };
  },

  createGroup: async (data: any) => {
    await delay(500);
    const newGroup: Group = {
      _id: `g${Date.now()}`,
      ...data,
      createdBy: mockUsers[0],
      members: []
    };
    mockGroups.push(newGroup);
    return {
      data: {
        success: true,
        group: newGroup
      }
    };
  },

  addGroupMember: async (groupId: string, studentId: string) => {
    await delay(300);
    const group = mockGroups.find(g => g._id === groupId);
    const student = mockStudents.find(s => s._id === studentId);
    if (group && student) {
      group.members.push({
        student,
        joinedAt: new Date().toISOString(),
        role: 'member'
      });
    }
    return {
      data: {
        success: true,
        group
      }
    };
  },

  removeGroupMember: async (groupId: string, studentId: string) => {
    await delay(300);
    const group = mockGroups.find(g => g._id === groupId);
    if (group) {
      group.members = group.members.filter(m => m.student._id !== studentId);
    }
    return {
      data: {
        success: true,
        group
      }
    };
  },

  // Attendance
  markAttendance: async (_data: any) => {
    await delay(500);
    return {
      data: {
        success: true,
        message: 'Attendance marked successfully'
      }
    };
  },

  getAttendanceByBatch: async (_batchId: string) => {
    await delay(300);
    return {
      data: {
        success: true,
        attendance: [] as any[]
      }
    };
  },

  // Class Planner
  getClassPlanner: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        classes: mockClassPlanner
      }
    };
  },

  getClassPlannerByBatch: async (batchId: string) => {
    await delay(300);
    return {
      data: {
        success: true,
        classes: mockClassPlanner.filter(c => c.batch._id === batchId)
      }
    };
  }
};

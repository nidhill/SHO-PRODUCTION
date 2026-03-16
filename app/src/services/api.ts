import axios from 'axios';

// ─── Axios instance with auth header ────────────────────────
// In production, VITE_API_URL points to the Render backend (e.g. https://xxx.onrender.com)
// In development, it's empty so Vite's proxy handles /api → localhost:5001
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth Service ──────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return { data: res.data };
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return { data: res.data };
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return { data: res.data };
  },
  updatePassword: async (data: any) => {
    const res = await api.put('/auth/profile/password', data);
    return { data: res.data };
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return { data: res.data };
  },
  resetPassword: async (token: string, password: string) => {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return { data: res.data };
  },
  updateProfile: async (data: { name?: string; phone?: string }) => {
    const res = await api.patch('/auth/profile', data);
    return { data: res.data };
  },
};

// ─── Sync Service ──────────────────────────────────────────
export const syncService = {
  syncData: async () => {
    const res = await api.post('/sync');
    return { data: res.data };
  },
  getUpcomingBatches: async () => {
    const res = await api.get('/sync/upcoming');
    return { data: res.data };
  }
};

// ─── User Service ──────────────────────────────────────────
export const userService = {
  getAll: async () => {
    const res = await api.get('/users');
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/users', data);
    return { data: res.data };
  },
  getByRole: async (role: string) => {
    const res = await api.get(`/users?role=${role}`);
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return { data: res.data };
  }
};

// ─── School Service ────────────────────────────────────────
export const schoolService = {
  getAll: async () => {
    const res = await api.get('/schools');
    return { data: res.data };
  },
  getAnalytics: async () => {
    const res = await api.get('/schools/analytics');
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/schools/${id}`);
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/schools', data);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/schools/${id}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/schools/${id}`);
    return { data: res.data };
  }
};

// ─── Batch Service ─────────────────────────────────────────
export const batchService = {
  getAll: async () => {
    const res = await api.get('/batches');
    return { data: res.data };
  },
  getAnalytics: async () => {
    const res = await api.get('/batches/analytics');
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/batches/${id}`);
    return { data: res.data };
  },
  getStudents: async (id: string) => {
    const res = await api.get(`/batches/${id}/students`);
    return { data: res.data };
  },
  getAttendance: async (id: string) => {
    const res = await api.get(`/attendance/batch/${id}`);
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/batches', data);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/batches/${id}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/batches/${id}`);
    return { data: res.data };
  },
  transferStudents: async (id: string, targetBatchId: string, studentIds?: string[]) => {
    const res = await api.post(`/batches/${id}/transfer`, { targetBatchId, studentIds });
    return { data: res.data };
  },
  assignSHO: async (id: string, userId: string | null) => {
    const res = await api.put(`/batches/${id}/assign-sho`, { userId });
    return { data: res.data };
  },
  assignSSHO: async (id: string, userId: string | null) => {
    const res = await api.put(`/batches/${id}/assign-ssho`, { userId });
    return { data: res.data };
  },
  addMentor: async (id: string, userId: string) => {
    const res = await api.post(`/batches/${id}/mentors`, { userId });
    return { data: res.data };
  },
  removeMentor: async (id: string, userId: string) => {
    const res = await api.delete(`/batches/${id}/mentors/${userId}`);
    return { data: res.data };
  }
};

// ─── Student Service ───────────────────────────────────────
export const studentService = {
  getAll: async (params?: any) => {
    const res = await api.get('/students', { params });
    return { data: res.data };
  },
  getAnalytics: async () => {
    const res = await api.get('/students/analytics');
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/students/${id}`);
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/students', data);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/students/${id}`, data);
    return { data: res.data };
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/students/${id}/status`, { status });
    return { data: res.data };
  },
  updateCoCurriculum: async (id: string, type: string, data: any) => {
    const res = await api.patch(`/students/${id}/co-curriculum/${type}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/students/${id}`);
    return { data: res.data };
  }
};

// ─── Attendance Service ────────────────────────────────────
export const attendanceService = {
  getByBatch: async (batchId: string, date?: string) => {
    const params: any = {};
    if (date) params.date = date;
    const res = await api.get(`/attendance/batch/${batchId}`, { params });
    return { data: res.data };
  },
  getByStudent: async (studentId: string) => {
    const res = await api.get(`/attendance/student/${studentId}`);
    return { data: res.data };
  },
  mark: async (data: any) => {
    const res = await api.post('/attendance', data);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/attendance/${id}`, data);
    return { data: res.data };
  }
};

// ─── Assignment Service ────────────────────────────────────
export const assignmentService = {
  getAll: async (params?: any) => {
    const res = await api.get('/assignments', { params });
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/assignments/${id}`);
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/assignments', data);
    return { data: res.data };
  },
  submit: async (id: string, data: any) => {
    const res = await api.post(`/assignments/${id}/submit`, data);
    return { data: res.data };
  },
  grade: async (id: string, data: any) => {
    const res = await api.patch(`/assignments/${id}/grade`, data);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/assignments/${id}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/assignments/${id}`);
    return { data: res.data };
  }
};

// ─── Feedback Service ──────────────────────────────────────
export const feedbackService = {
  getAll: async (params?: any) => {
    const res = await api.get('/feedback', { params });
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/feedback/${id}`);
    return { data: res.data };
  },
  sendForm: async (data: any) => {
    const res = await api.post('/feedback/form/send', data);
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/feedback', data);
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/feedback/${id}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/feedback/${id}`);
    return { data: res.data };
  }
};

// ─── Notification Service ──────────────────────────────────
export const notificationService = {
  getAll: async (params?: any) => {
    const res = await api.get('/notifications', { params });
    return { data: res.data };
  },
  getForStudent: async (studentId: string) => {
    const res = await api.get(`/notifications/student/${studentId}`);
    return { data: res.data };
  },
  getById: async (id: string) => {
    const res = await api.get(`/notifications/${id}`);
    return { data: res.data };
  },
  create: async (data: any) => {
    const res = await api.post('/notifications', data);
    return { data: res.data };
  },
  markAsRead: async (id: string, studentId: string) => {
    const res = await api.patch(`/notifications/${id}/read`, { studentId });
    return { data: res.data };
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/notifications/${id}`, data);
    return { data: res.data };
  },
  delete: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return { data: res.data };
  }
};

// ─── Class Planner Service ─────────────────────────────────
export const classPlannerService = {
  getAll: async () => {
    const res = await api.get('/class-planner');
    return { data: res.data };
  },
  getByBatch: async (batchId: string) => {
    const res = await api.get(`/class-planner/batch/${batchId}`);
    return { data: res.data };
  }
};

// ─── Audit Service ─────────────────────────────────────────
export const auditService = {
  getAll: async () => {
    const res = await api.get('/audit-logs');
    return { data: res.data };
  }
};

// ─── System & Storage Service ────────────────────────────────
export const systemService = {
  getStorageStats: async () => {
    const res = await api.get('/system/storage');
    return { data: res.data };
  }
};

export default {
  auth: authService,
  users: userService,
  schools: schoolService,
  batches: batchService,
  students: studentService,
  attendance: attendanceService,
  assignments: assignmentService,
  feedback: feedbackService,
  notifications: notificationService,
  classPlanner: classPlannerService,
  audit: auditService,
  system: systemService
};

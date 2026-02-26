export interface User {
  id: string;
  name: string;
  email: string;
  role: 'sho' | 'ssho' | 'academic' | 'pl' | 'mentor' | 'leadership' | 'head_academics' | 'ceo_haca' | 'sho_team_lead';
  assignedBatches?: Batch[];
  assignedSchools?: School[];
  phone?: string;
}

export interface School {
  _id: string;
  name: string;
  address: string;
  place: string;
  contactNumber?: string;
  email?: string;
  totalBatches?: number;
  totalStudents?: number;
}

export interface Batch {
  _id: string;
  name: string;
  code: string;
  school: School;
  assignedSHO?: User;
  assignedMentors?: User[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on_hold';
  totalStudents: number;
  averageAttendance: number;
  averageFeedbackScore: number;
  assignmentCompletionRate: number;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  age: number;
  qualification: string;
  address: string;
  place: string;
  mobileNumber: string;
  parentGuardianNumber: string;
  careerDreamsGoals: string;
  batch: Batch;
  school: School;
  status: 'active' | 'placed' | 'interview_required' | 'revoked';
  coCurriculum?: {
    presentationSessions: CoCurriculumActivity[];
    communicationSessions: CoCurriculumActivity[];
    personalityDevelopment: CoCurriculumActivity[];
    mockInterviews: CoCurriculumActivity[];
    reviews: Review[];
  };
  attendanceSummary?: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    percentage: number;
  };
  assignmentSummary?: {
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    completionRate: number;
  };
  overallPerformance?: number;
}

export interface CoCurriculumActivity {
  date: string;
  topic: string;
  score?: number;
  feedback?: string;
  attended: boolean;
}

export interface Review {
  date: string;
  reviewer: string;
  overallScore: number;
  comments: string;
  areasOfImprovement: string[];
}

export interface Attendance {
  _id: string;
  batch: string;
  date: string;
  students: {
    student: Student;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
  }[];
  markedBy: User;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  batch: Batch;
  assignedBy: User;
  dueDate: string;
  attachments: Attachment[];
  submissions: Submission[];
  totalMarks: number;
  status: 'active' | 'closed' | 'draft';
}

export interface Attachment {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface Submission {
  student: Student;
  submittedAt: string;
  attachments: Attachment[];
  status: 'submitted' | 'graded' | 'late' | 'resubmitted';
  score?: number;
  feedback?: string;
  remarks?: string;
}

export interface FeedbackItem {
  _id: string;
  type: 'student' | 'batch' | 'session' | 'mentor' | 'general';
  student?: Student;
  batch?: Batch;
  givenBy: User;
  ratings: {
    overall?: number;
    communication?: number;
    punctuality?: number;
    understanding?: number;
    participation?: number;
  };
  comments: string;
  areasOfImprovement: string[];
  strengths: string[];
  sessionDetails?: {
    date: string;
    topic: string;
    sessionType: string;
  };
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'individual' | 'batch' | 'group';
  sentBy: User;
  recipients: {
    allStudents: boolean;
    batches: Batch[];
    students: Student[];
    groups: Group[];
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  readStatus: {
    recipient: string;
    readAt?: string;
    isRead: boolean;
  }[];
  attachments: Attachment[];
  sentAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  batch: Batch;
  createdBy: User;
  members: {
    student: Student;
    joinedAt: string;
    role: 'member' | 'leader' | 'co_leader';
  }[];
  groupType: 'study' | 'project' | 'discussion' | 'activity' | 'general';
}

export interface Analytics {
  totalBatches: number;
  totalStudents: number;
  averageAttendance: number;
  averageFeedbackScore: number;
  assignmentCompletionRate: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  target?: string;
  details: string;
  timestamp: string;
  ip: string;
}

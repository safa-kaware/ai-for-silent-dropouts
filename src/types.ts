export type RiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

export interface StudentHistory {
  date: string;
  attendance: number;
  avgMarks: number;
  risk: RiskLevel;
  subjectMarks: Record<string, number>;
}

export interface Student {
  "Name": string;
  "Roll No": number;
  "Email": string;
  "Student Phone": string;
  "Parent Phone": string;
  "Attendance (%)": number;
  "Assignments (/10)": number;
  "Avg Marks"?: number;
  "Weakest Subject"?: string;
  "Weakest Score"?: number;
  "Predicted Risk"?: RiskLevel;
  "History"?: StudentHistory[];
  [key: string]: any; // Allow for dynamic subject columns
}

export interface AppState {
  loggedIn: boolean;
  geminiKey: string;
  twSid: string;
  twToken: string;
  twPhone: string;
  students: Student[];
}

export interface StudyMaterial {
  title: string;
  subject: string;
  for_risk: RiskLevel[];
  type: "Upload File (PDF/Docs)" | "External Link";
  file_name?: string;
  file_data?: string | Uint8Array | null;
  link?: string;
  description?: string;
  uploaded_on: string;
}

export interface FollowUpLog {
  student: string;
  action: string;
  notes: string;
  followup_date: string;
  status: string;
  logged_on: string;
}

export interface ResourceAccessLog {
  studentName: string;
  resourceTitle: string;
  resourceLink: string;
  accessedAt: string;
}

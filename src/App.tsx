import { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, Brain, Mail, Upload, AlertCircle, XCircle, Home } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Student, RiskLevel, StudyMaterial, FollowUpLog, ResourceAccessLog } from "./types";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import ExplainableAI from "./components/ExplainableAI";
import ActionPanel from "./components/ActionPanel";
import RecoveryPlan from "./components/RecoveryPlan";
import StudyMaterialTab from "./components/StudyMaterial";
import FollowUpTracker from "./components/FollowUpTracker";
import StudentPortal from "./components/StudentPortal";
import LandingPage from "./components/LandingPage";

const DEFAULT_STUDENTS: Student[] = [
  {
    "Name": "Aarav Sharma",
    "Roll No": 200,
    "Email": "aarav_200@college.edu",
    "Student Phone": "9876543210",
    "Parent Phone": "9123456789",
    "Attendance (%)": 72,
    "Maths (/100)": 68,
    "Physics (/100)": 45,
    "Chemistry (/100)": 80,
    "Computer Science (/100)": 55,
    "English (/100)": 71,
    "Assignments (/10)": 7,
    "Avg Marks": 63.8,
    "Weakest Subject": "Physics (/100)",
    "Weakest Score": 45,
    "Predicted Risk": "Medium Risk",
    "History": []
  },
  {
    "Name": "Aditi Rao",
    "Roll No": 201,
    "Email": "aditi_201@college.edu",
    "Student Phone": "9876543211",
    "Parent Phone": "9123456790",
    "Attendance (%)": 28,
    "Maths (/100)": 32,
    "Physics (/100)": 25,
    "Chemistry (/100)": 40,
    "Computer Science (/100)": 30,
    "English (/100)": 45,
    "Assignments (/10)": 3,
    "Avg Marks": 34.4,
    "Weakest Subject": "Physics (/100)",
    "Weakest Score": 25,
    "Predicted Risk": "High Risk",
    "History": []
  },
  {
    "Name": "Arjun Patel",
    "Roll No": 202,
    "Email": "arjun_202@college.edu",
    "Student Phone": "9876543212",
    "Parent Phone": "9123456791",
    "Attendance (%)": 85,
    "Maths (/100)": 92,
    "Physics (/100)": 88,
    "Chemistry (/100)": 95,
    "Computer Science (/100)": 90,
    "English (/100)": 82,
    "Assignments (/10)": 9,
    "Avg Marks": 89.4,
    "Weakest Subject": "English (/100)",
    "Weakest Score": 82,
    "Predicted Risk": "Low Risk",
    "History": []
  },
  {
    "Name": "Ananya Iyer",
    "Roll No": 203,
    "Email": "ananya_203@college.edu",
    "Student Phone": "9876543213",
    "Parent Phone": "9123456792",
    "Attendance (%)": 55,
    "Maths (/100)": 58,
    "Physics (/100)": 62,
    "Chemistry (/100)": 45,
    "Computer Science (/100)": 52,
    "English (/100)": 60,
    "Assignments (/10)": 4,
    "Avg Marks": 55.4,
    "Weakest Subject": "Chemistry (/100)",
    "Weakest Score": 45,
    "Predicted Risk": "Medium Risk",
    "History": []
  },
  {
    "Name": "Ishaan Gupta",
    "Roll No": 204,
    "Email": "ishaan_204@college.edu",
    "Student Phone": "9876543214",
    "Parent Phone": "9123456793",
    "Attendance (%)": 32,
    "Maths (/100)": 45,
    "Physics (/100)": 38,
    "Chemistry (/100)": 50,
    "Computer Science (/100)": 42,
    "English (/100)": 55,
    "Assignments (/10)": 5,
    "Avg Marks": 46.0,
    "Weakest Subject": "Physics (/100)",
    "Weakest Score": 38,
    "Predicted Risk": "High Risk",
    "History": []
  }
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userType, setUserType] = useState<"faculty" | "student" | null>(null);
  const [loginType, setLoginType] = useState<"faculty" | "student">("faculty");
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState("Main Dashboard");
  const [storageFull, setStorageFull] = useState(false);
  
  // Persistent States
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem("mu_students");
      if (!saved) return DEFAULT_STUDENTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENTS;
    } catch (e) {
      console.error("Error loading students from localStorage:", e);
      return DEFAULT_STUDENTS;
    }
  });
  
  const [geminiKey, setGeminiKey] = useState(() => {
    try {
      return localStorage.getItem("mu_gemini_key") || "";
    } catch (e) {
      return "";
    }
  });

  const [twSid, setTwSid] = useState(() => {
    try {
      return localStorage.getItem("mu_tw_sid") || "";
    } catch (e) {
      return "";
    }
  });
  const [twToken, setTwToken] = useState(() => {
    try {
      return localStorage.getItem("mu_tw_token") || "";
    } catch (e) {
      return "";
    }
  });
  const [twPhone, setTwPhone] = useState(() => {
    try {
      return localStorage.getItem("mu_tw_phone") || "";
    } catch (e) {
      return "";
    }
  });

  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem("mu_materials");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  
  const [followupLog, setFollowupLog] = useState<FollowUpLog[]>(() => {
    try {
      const saved = localStorage.getItem("mu_followup");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [resourceAccessLogs, setResourceAccessLogs] = useState<ResourceAccessLog[]>(() => {
    try {
      const saved = localStorage.getItem("mu_resource_logs");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem("mu_students", JSON.stringify(students));
      setStorageFull(false);
    } catch (e) {
      console.error("Failed to save students to localStorage:", e);
      setStorageFull(true);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem("mu_gemini_key", geminiKey);
    } catch (e) {
      console.error("Failed to save Gemini key to localStorage:", e);
    }
  }, [geminiKey]);

  useEffect(() => {
    try {
      localStorage.setItem("mu_tw_sid", twSid);
      localStorage.setItem("mu_tw_token", twToken);
      localStorage.setItem("mu_tw_phone", twPhone);
    } catch (e) {
      console.error("Failed to save Twilio credentials to localStorage:", e);
    }
  }, [twSid, twToken, twPhone]);

  useEffect(() => {
    try {
      localStorage.setItem("mu_materials", JSON.stringify(studyMaterials));
      setStorageFull(false);
    } catch (e) {
      console.error("Failed to save materials to localStorage:", e);
      setStorageFull(true);
    }
  }, [studyMaterials]);

  useEffect(() => {
    try {
      localStorage.setItem("mu_followup", JSON.stringify(followupLog));
      setStorageFull(false);
    } catch (e) {
      console.error("Failed to save followup log to localStorage:", e);
      setStorageFull(true);
    }
  }, [followupLog]);

  useEffect(() => {
    try {
      localStorage.setItem("mu_resource_logs", JSON.stringify(resourceAccessLogs));
      setStorageFull(false);
    } catch (e) {
      console.error("Failed to save resource logs to localStorage:", e);
      setStorageFull(true);
    }
  }, [resourceAccessLogs]);

  const handleLogin = (success: boolean, type: "faculty" | "student", studentData?: Student) => {
    if (success) {
      setLoggedIn(true);
      setUserType(type);
      if (type === "student" && studentData) {
        setLoggedInStudent(studentData);
        setActiveTab("Student Portal");
      }
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserType(null);
    setLoggedInStudent(null);
    setActiveTab("Main Dashboard");
    setShowLogin(false);
  };

  const predictRisk = (attendance: number, avgMarks: number, minMark: number, assignments: number): RiskLevel => {
    if (attendance < 35 || avgMarks < 40 || minMark < 30) return "High Risk";
    if (attendance < 60 || avgMarks < 60 || minMark < 50 || assignments < 5) return "Medium Risk";
    return "Low Risk";
  };

  const handleFileUpload = (data: any) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Uploaded data is not an array or is empty:", data);
      return;
    }
    
    // Dynamically detect subject columns (e.g., columns ending with (/100))
    const firstRow = data[0];
    const SUBJECT_COLS = Object.keys(firstRow).filter(key => key.includes("(/100)"));
    
    try {
      const processedData = data.map(s => {
        const attendance = Number(s["Attendance (%)"]) || 0;
        const assignments = Number(s["Assignments (/10)"]) || 0;
        const rollNo = Number(s["Roll No"]) || 0;
        const email = s["Email"]?.toString().toLowerCase() || "";
        
        const subjectMarks = SUBJECT_COLS.map(col => Number(s[col]) || 0);
        const avgMarks = subjectMarks.length > 0 
          ? Number((subjectMarks.reduce((a, b) => a + b, 0) / subjectMarks.length).toFixed(2))
          : 0;
        const minMark = subjectMarks.length > 0 ? Math.min(...subjectMarks) : 0;
        
        // Find weakest subject
        let weakestSubject = SUBJECT_COLS[0] || "N/A";
        let weakestScore = subjectMarks[0] || 0;
        subjectMarks.forEach((score, idx) => {
          if (score < weakestScore) {
            weakestScore = score;
            weakestSubject = SUBJECT_COLS[idx];
          }
        });

        const risk = predictRisk(attendance, avgMarks, minMark, assignments);

        // Find existing student to preserve history
        const existingStudent = students.find(st => st["Roll No"] === rollNo || st["Email"]?.toLowerCase() === email);
        let history = existingStudent?.History || [];

        // If existing student found, add current state to history before updating
        if (existingStudent) {
          const currentSubjectMarks: Record<string, number> = {};
          SUBJECT_COLS.forEach(col => {
            currentSubjectMarks[col] = Number(existingStudent[col]) || 0;
          });

          const historyEntry = {
            date: new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
            attendance: existingStudent["Attendance (%)"],
            avgMarks: existingStudent["Avg Marks"] || 0,
            risk: existingStudent["Predicted Risk"] || "Low Risk",
            subjectMarks: currentSubjectMarks
          };
          
          // Only add if it's different from the last history entry or if history is empty
          const lastEntry = history[history.length - 1];
          if (!lastEntry || lastEntry.avgMarks !== historyEntry.avgMarks || lastEntry.attendance !== historyEntry.attendance) {
            history = [...history, historyEntry];
          }
        }

        const studentUpdate: any = {
          ...s,
          "Attendance (%)": attendance,
          "Assignments (/10)": assignments,
          "Roll No": rollNo,
          "Avg Marks": avgMarks,
          "Weakest Subject": weakestSubject,
          "Weakest Score": weakestScore,
          "Predicted Risk": risk,
          "History": history
        };

        // Ensure all subject columns are numbers
        SUBJECT_COLS.forEach(col => {
          studentUpdate[col] = Number(s[col]) || 0;
        });

        return studentUpdate as Student;
      });
      setStudents(processedData);
    } catch (e) {
      console.error("Error processing uploaded file:", e);
    }
  };

  if (!loggedIn) {
    if (showLogin) {
      return (
        <Login 
          students={students} 
          onLogin={handleLogin} 
          initialType={loginType}
          onBack={() => setShowLogin(false)} 
        />
      );
    }
    return (
      <LandingPage 
        onLoginClick={(type) => {
          setLoginType(type);
          setShowLogin(true);
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-scholar-bg overflow-hidden font-sans">
      {/* Sidebar - Only for Faculty */}
      {userType === "faculty" && (
        <Sidebar 
          onFileUpload={handleFileUpload}
          geminiKey={geminiKey}
          setGeminiKey={setGeminiKey}
          twSid={twSid}
          setTwSid={setTwSid}
          twToken={twToken}
          setTwToken={setTwToken}
          twPhone={twPhone}
          setTwPhone={setTwPhone}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/60 backdrop-blur-xl px-8 py-6 flex justify-between items-center border-b border-gray-100/50 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-scholar-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-scholar-primary/20">
              🎓
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              EduTrack <span className="text-scholar-primary">AI</span> Prediction
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-scholar-primary transition-colors px-4 py-2 rounded-full hover:bg-scholar-bg"
            >
              <Home className="w-4 h-4" /> Home
            </button>
            {userType === "student" && (
              <button 
                onClick={handleLogout}
                className="scholar-btn-secondary !px-6 !py-2 !text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {storageFull && (
            <div className="max-w-7xl mx-auto mb-8 p-4 bg-red-50 border-none rounded-scholar flex items-center justify-between gap-4 shadow-lg shadow-red-100">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-semibold">
                  Storage Limit Exceeded: Please clear old data to free up space.
                </p>
              </div>
              <button 
                onClick={() => setStorageFull(false)}
                className="text-red-400 hover:text-red-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {students.length === 0 && userType === "faculty" ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6">
              <div className="w-32 h-32 bg-white rounded-scholar shadow-2xl flex items-center justify-center animate-bounce">
                <Upload className="w-12 h-12 text-scholar-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-gray-900">Welcome to Scholar Portal</p>
                <p className="text-gray-500">Please upload a student data file from the sidebar to begin analysis.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Tabs - Only for Faculty */}
              {userType === "faculty" && (
                <div className="flex flex-wrap gap-3 p-2 bg-white rounded-full shadow-lg w-fit mx-auto">
                  {[
                    { id: "Main Dashboard", label: "📊 Dashboard" },
                    { id: "Deep Analytics", label: "📈 Analytics" },
                    { id: "Explainable AI", label: "🧠 AI Insights" },
                    { id: "Action Panel", label: "✉️ Actions" },
                    { id: "Recovery Plan", label: "🗺️ Plans" },
                    { id: "Study Material", label: "📚 Materials" },
                    { id: "Follow-up Tracker", label: "📅 Tracker" },
                    { id: "Student Portal", label: "🎓 Portal" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-scholar-primary text-white shadow-lg shadow-scholar-primary/30"
                          : "text-gray-500 hover:bg-scholar-bg hover:text-scholar-primary"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "Main Dashboard" && <Dashboard students={students} />}
                  {activeTab === "Deep Analytics" && <Analytics students={students} />}
                  {activeTab === "Explainable AI" && <ExplainableAI students={students} />}
                  {activeTab === "Action Panel" && (
                    <ActionPanel 
                      students={students} 
                      geminiKey={geminiKey}
                      twSid={twSid}
                      twToken={twToken}
                      twPhone={twPhone}
                    />
                  )}
                  {activeTab === "Recovery Plan" && <RecoveryPlan students={students} geminiKey={geminiKey} />}
                  {activeTab === "Study Material" && (
                    <StudyMaterialTab 
                      materials={studyMaterials} 
                      students={students}
                      onUpload={(m) => setStudyMaterials(prev => [...prev, m])} 
                      onClearMaterials={() => {
                        if (window.confirm("Are you sure you want to clear all uploaded study materials? This will free up storage space.")) {
                          setStudyMaterials([]);
                        }
                      }}
                      onResourceAccess={(title, link) => {
                        const newLog: ResourceAccessLog = {
                          studentName: loggedInStudent ? loggedInStudent.Name : "Anonymous/Faculty",
                          resourceTitle: title,
                          resourceLink: link,
                          accessedAt: new Date().toLocaleString("en-GB")
                        };
                        setResourceAccessLogs(prev => [...prev, newLog]);
                      }}
                    />
                  )}
                  {activeTab === "Follow-up Tracker" && (
                    <FollowUpTracker 
                      students={students} 
                      logs={followupLog} 
                      onLog={(l) => setFollowupLog(prev => [...prev, l])} 
                      onClearLogs={() => {
                        if (window.confirm("Are you sure you want to clear all intervention logs?")) {
                          setFollowupLog([]);
                        }
                      }}
                      onClearResourceLogs={() => {
                        if (window.confirm("Are you sure you want to clear all resource access logs?")) {
                          setResourceAccessLogs([]);
                        }
                      }}
                      resourceLogs={resourceAccessLogs}
                    />
                  )}
                  {activeTab === "Student Portal" && (
                    <StudentPortal 
                      students={students} 
                      materials={studyMaterials} 
                      geminiKey={geminiKey} 
                      loggedInStudent={loggedInStudent}
                      onResourceAccess={(title, link) => {
                        const newLog: ResourceAccessLog = {
                          studentName: loggedInStudent ? loggedInStudent.Name : "Guest Student",
                          resourceTitle: title,
                          resourceLink: link,
                          accessedAt: new Date().toLocaleString("en-GB")
                        };
                        setResourceAccessLogs(prev => [...prev, newLog]);
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

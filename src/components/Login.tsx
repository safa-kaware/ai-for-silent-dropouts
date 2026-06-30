import { useState, FormEvent, useEffect } from "react";
import { ShieldCheck, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Student } from "../types";

interface LoginProps {
  students: Student[];
  onLogin: (success: boolean, type: "faculty" | "student", studentData?: Student) => void;
  initialType?: "faculty" | "student";
  onBack?: () => void;
}

export default function Login({ students, onLogin, initialType = "faculty", onBack }: LoginProps) {
  const [activeType, setActiveType] = useState<"faculty" | "student">(initialType);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveType(initialType);
  }, [initialType]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeType === "faculty") {
      if (username === "admin" && password === "password123") {
        onLogin(true, "faculty");
      } else {
        setError("Invalid faculty credentials. Please try again.");
      }
    } else {
      // Student Login via Email
      if (!studentEmail) {
        setError("Please enter your student email ID.");
        return;
      }

      const foundStudent = students.find(
        (s) => s.Email?.toLowerCase() === studentEmail.toLowerCase()
      );

      if (foundStudent) {
        onLogin(true, "student", foundStudent);
      } else {
        setError(
          students.length === 0 
            ? "Student roster has not been uploaded yet. Please contact your faculty." 
            : "Email ID not found in the student roster. Please check and try again."
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-scholar-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-scholar-primary rounded-3xl flex items-center justify-center text-white text-4xl shadow-2xl shadow-scholar-primary/30 mx-auto transform -rotate-6">
            🎓
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            AI for <span className="text-scholar-primary">Silent Dropouts</span>
          </h2>
          <p className="text-gray-500 font-medium">
            Welcome back! Please select your portal to continue.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-2 rounded-full shadow-xl">
          <button
            onClick={() => { setActiveType("faculty"); setError(""); }}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all duration-300 ${
              activeType === "faculty" ? "bg-scholar-primary text-white shadow-lg" : "text-gray-500 hover:text-scholar-primary"
            }`}
          >
            👨‍🏫 Faculty
          </button>
          <button
            onClick={() => { setActiveType("student"); setError(""); }}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all duration-300 ${
              activeType === "student" ? "bg-scholar-primary text-white shadow-lg" : "text-gray-500 hover:text-scholar-primary"
            }`}
          >
            🧑‍🎓 Student
          </button>
        </div>

        {activeType === "faculty" && (
          <div className="bg-white/50 backdrop-blur-sm border border-scholar-primary/10 rounded-scholar p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-scholar-primary mt-0.5" />
            <div>
              <p className="text-xs font-bold text-scholar-primary uppercase tracking-wider">Demo Access</p>
              <p className="text-sm text-gray-600">admin | password123</p>
            </div>
          </div>
        )}

        {activeType === "student" && (
          <div className="bg-white/50 backdrop-blur-sm border border-scholar-primary/10 rounded-scholar p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-scholar-primary mt-0.5" />
              <div>
                <p className="text-xs font-bold text-scholar-primary uppercase tracking-wider">Demo Student Logins</p>
                <div className="text-xs text-gray-600 space-y-1.5 mt-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Click to autofill:</p>
                  <button 
                    type="button"
                    onClick={() => setStudentEmail("aditi_201@college.edu")}
                    className="underline hover:text-scholar-primary text-left block font-medium"
                  >
                    🔴 High Risk: aditi_201@college.edu (Aditi Rao)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStudentEmail("aarav_200@college.edu")}
                    className="underline hover:text-scholar-primary text-left block font-medium"
                  >
                    🟡 Medium Risk: aarav_200@college.edu (Aarav Sharma)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStudentEmail("arjun_202@college.edu")}
                    className="underline hover:text-scholar-primary text-left block font-medium"
                  >
                    🟢 Low Risk: arjun_202@college.edu (Arjun Patel)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-4 space-y-6 scholar-card" onSubmit={handleSubmit}>
          {activeType === "faculty" ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-4">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="scholar-input"
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-4">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="scholar-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-3 mb-4">
                <div className="p-5 bg-scholar-bg rounded-3xl w-20 h-20 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-scholar-primary" />
                </div>
                <p className="text-sm text-gray-500 font-medium px-4">
                  Enter your registered student email to access your personalized dashboard.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-scholar-primary" /> Student Email ID
                </label>
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="scholar-input"
                  placeholder="name@university.edu"
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-500 text-sm font-semibold flex items-center gap-2 bg-red-50 p-4 rounded-2xl border border-red-100"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full scholar-btn-primary py-4 text-lg"
          >
            {activeType === "faculty" ? "Faculty Login" : "Student Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Search, User, Mail, Download, Sparkles, AlertTriangle, Loader2, ExternalLink, FileText, Link as LinkIcon, Settings, Bot, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Student, StudyMaterial, RiskLevel } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

interface StudentPortalProps {
  students: Student[];
  materials: StudyMaterial[];
  geminiKey: string;
  loggedInStudent?: Student | null;
  onResourceAccess?: (resourceTitle: string, resourceLink: string) => void;
}

export default function StudentPortal({ students, materials, geminiKey, loggedInStudent, onResourceAccess }: StudentPortalProps) {
  const [rollInput, setRollInput] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subjectCols = student ? Object.keys(student).filter(key => key.includes("(/100)")) : [];

  const getCleanSubjectName = (subject: string) => subject.replace(" (/100)", "").trim();

  const getSmartLinks = (subject: string) => {
    const clean = getCleanSubjectName(subject);
    return [
      {
        name: `NPTEL: ${clean}`,
        link: `https://nptel.ac.in/courses?search=${encodeURIComponent(clean)}`
      },
      {
        name: `Coursera: ${clean}`,
        link: `https://www.coursera.org/search?query=${encodeURIComponent(clean)}`
      }
    ];
  };

  // Set student automatically if loggedInStudent is provided
  useEffect(() => {
    if (loggedInStudent) {
      setStudent(loggedInStudent);
    }
  }, [loggedInStudent]);

  const handleViewReport = () => {
    const rollNo = parseInt(rollInput);
    if (isNaN(rollNo)) {
      setError("❌ Please enter a valid numeric Roll Number.");
      setStudent(null);
      return;
    }

    const found = students.find(s => s["Roll No"] === rollNo);
    if (!found) {
      setError("❌ Roll Number not found. Please check and try again.");
      setStudent(null);
    } else {
      setStudent(found);
      setError(null);
      setPlan(null);
    }
  };

  useEffect(() => {
    if (student && (student["Predicted Risk"] === "High Risk" || student["Predicted Risk"] === "Medium Risk")) {
      generatePlan(student);
    }
  }, [student]);

  const generatePlan = async (selectedStudent: Student) => {
    if (!geminiKey) return;

    setLoadingPlan(true);
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const prompt = `You are a kind, supportive, and highly experienced academic mentor at a top Indian university. 
      You are writing a personal letter to a student named ${selectedStudent.Name} to help them navigate their current academic journey.
      
      The student's current status is ${selectedStudent["Predicted Risk"]}. 
      Data: Attendance: ${selectedStudent["Attendance (%)"]}%, Marks: ${selectedStudent["Avg Marks"]} /100, Assignments: ${selectedStudent["Assignments (/10)"]} /10.

      Write a warm, humanized, and encouraging 4-week "Growth Roadmap". 
      
      GUIDELINES:
      1. Tone: Empathetic, non-judgmental, and deeply motivating. Use "we" and "our" to show support.
      2. Structure: 
         - Start with a warm personal greeting: "Hi ${selectedStudent.Name}, I've been looking at your progress and I want you to know that I'm here to support you..."
         - Acknowledge their strengths first (even if small).
         - Break the 4 weeks into "Phases" with catchy, positive names (e.g., "Phase 1: Finding Our Rhythm").
         - For each phase, provide 3-4 gentle, actionable steps. Avoid making it look like a congested list of chores.
         - Include a "Mindset Tip" or "Self-Care" suggestion for each week.
         - End with a powerful, personalized closing that makes them feel special and capable.
      
      3. Formatting: Use clear spacing and bullet points, but keep the language conversational. Avoid "AI-speak" or overly formal academic jargon.
      
      Focus on helping them improve their ${selectedStudent["Weakest Subject"]} (where they scored ${selectedStudent["Weakest Score"]}) and their attendance.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setPlan(response.text || "I'm sorry, I couldn't generate your plan right now. Please reach out to me directly!");
    } catch (err: any) {
      console.error("Gemini Error:", err);
      // Fallback
      const fallback = `Hi ${selectedStudent.Name},

I've been looking over your academic journey so far, and I want you to know that every student faces hurdles—what matters is how we choose to move forward. You have so much potential, and we're going to unlock it together.

Here is a gentle roadmap I've put together for us:

🌱 Phase 1: Finding Our Rhythm (Week 1)
• Let's start by attending every single class this week. Just showing up is 50% of the battle!
• Pick one topic in ${selectedStudent["Weakest Subject"]} that feels confusing and spend 30 minutes just reading about it—no pressure.
• Reach out to one friend or teacher for a quick chat about a doubt you have.
• Mindset Tip: Take 5 minutes each morning to breathe and remind yourself: "I am capable of learning."

🚀 Phase 2: Building Momentum (Week 2)
• We'll focus on those assignments. Let's try to finish just one pending task by Wednesday.
• Spend an hour this week reviewing your notes from ${selectedStudent["Weakest Subject"]}. You'll be surprised how much you actually know!
• Try to sit in the front row of your classes—it helps stay engaged and makes the time go faster.
• Self-Care: Make sure you're getting enough sleep. A rested mind learns much faster!

📈 Phase 3: Strengthening the Foundation (Week 3)
• Let's tackle a small practice test or a few problems. It's okay to make mistakes—that's how we grow.
• Review the feedback on your previous assignments to see where we can pick up easy marks.
• Keep that attendance streak going! You're doing great.
• Mindset Tip: Celebrate a "Small Win" today, like finishing a chapter or asking a question in class.

✨ Phase 4: Confidence & Consistency (Week 4)
• We're looking at the big picture now. Let's organize our notes for the upcoming exams.
• Spend a little extra time on ${selectedStudent["Weakest Subject"]} to turn that challenge into a strength.
• Reflect on how much more confident you feel compared to Week 1.
• Self-Care: Treat yourself to something you enjoy this weekend. You've worked hard!

${selectedStudent.Name}, I truly believe in you. You aren't defined by a single score or a percentage—you are defined by your resilience. Let's make this happen!`;
      setPlan(fallback);
    } finally {
      setLoadingPlan(false);
    }
  };

  const downloadPlan = () => {
    if (!plan || !student) return;
    const element = document.createElement("a");
    const file = new Blob([plan], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `My_Recovery_Plan_${student.Name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getPerformanceBasedMaterials = () => {
    if (!student) return [];
    
    // 1. Identify subjects where student scored < 60
    const subjectsToImprove: string[] = [];
    const performanceMap = [
      { key: "Maths (/100)", name: "Math" },
      { key: "Physics (/100)", name: "Physics" },
      { key: "Chemistry (/100)", name: "Chemistry" },
      { key: "Computer Science (/100)", name: "Computer" },
      { key: "English (/100)", name: "English" }
    ];

    performanceMap.forEach(item => {
      const score = Number(student[item.key as keyof Student]) || 0;
      if (score < 60) {
        subjectsToImprove.push(item.name.toLowerCase());
      }
    });

    // 2. Filter materials:
    // - Must match risk level
    // - AND (Subject matches a weak subject OR it's a general resource)
    return materials.filter(m => {
      const riskMatch = m.for_risk.includes(student["Predicted Risk"] as RiskLevel);
      if (!riskMatch) return false;

      // If student is doing well in everything, show all risk-appropriate materials
      if (subjectsToImprove.length === 0) return true;

      const materialSubject = m.subject.toLowerCase();
      const isWeakSubjectMatch = subjectsToImprove.some(weakSub => materialSubject.includes(weakSub));
      
      // Also include "Other" or general materials if they match risk
      const isGeneral = materialSubject.includes("other") || materialSubject.includes("general");

      return isWeakSubjectMatch || isGeneral;
    });
  };

  const recommendedMaterials = getPerformanceBasedMaterials();

  const handleDownload = (material: StudyMaterial) => {
    if (material.file_data && typeof material.file_data === "string") {
      const link = document.createElement("a");
      link.href = material.file_data;
      link.download = material.file_name || "download";
      link.click();
    }
  };

  const handleResourceClick = (title: string, link: string) => {
    if (onResourceAccess) {
      onResourceAccess(title, link);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          Student <span className="text-scholar-primary">Self-Service</span> Portal
        </h3>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Access your personalized academic roadmap, track your performance, and discover resources tailored just for you.
        </p>
      </div>
      
      <div className="bg-scholar-primary/5 p-6 rounded-scholar border border-scholar-primary/10 text-scholar-primary text-sm font-bold text-center shadow-inner">
        {loggedInStudent 
          ? `👋 Welcome back, ${loggedInStudent.Name}! Your personalized dashboard is ready.`
          : "👋 Students: Enter your Roll Number below to unlock your academic insights."
        }
      </div>

      {!loggedInStudent && (
        <div className="scholar-card space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-4">Enter Your Roll Number</label>
              <input
                type="text"
                value={rollInput}
                onChange={(e) => setRollInput(e.target.value)}
                placeholder="e.g., 101"
                disabled={students.length === 0}
                className="scholar-input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleViewReport}
                disabled={students.length === 0}
                className="scholar-btn-primary w-full md:w-auto flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> View My Report
              </button>
            </div>
          </div>

          {students.length === 0 && (
            <div className="p-6 bg-orange-50 text-orange-700 border border-orange-100 rounded-scholar text-sm font-bold flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              The faculty has not uploaded the student roster yet. Please check back later.
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-red-50 text-red-700 border border-red-100 rounded-scholar text-sm font-bold"
            >
              {error}
            </motion.div>
          )}
        </div>
      )}

      {student && (
          <div className="space-y-12">
            {/* Block 1: Identity */}
            <div className="scholar-card !bg-scholar-primary text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-80">Student Profile</p>
                <h2 className="text-5xl font-black tracking-tight flex items-center gap-4 justify-center md:justify-start">
                  {student.Name}
                </h2>
                <p className="text-lg font-medium opacity-90">University Roll No: <span className="font-black">{student["Roll No"]}</span></p>
              </div>
              <div className="relative z-10 flex gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center shadow-xl">
                  <p className="text-[10px] font-bold uppercase opacity-80">Rank</p>
                  <p className="text-2xl font-black">#--</p>
                </div>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center shadow-xl">
                  <p className="text-[10px] font-bold uppercase opacity-80">Year</p>
                  <p className="text-2xl font-black">1st</p>
                </div>
              </div>
            </div>

            {/* Block 2: Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="scholar-card text-center group">
                <div className="w-16 h-16 bg-scholar-bg rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-scholar-primary group-hover:text-white transition-all duration-500">
                  <User className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Attendance</p>
                <p className="text-4xl font-black text-gray-900">{student["Attendance (%)"]}%</p>
              </div>
              <div className="scholar-card text-center group">
                <div className="w-16 h-16 bg-scholar-bg rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-scholar-secondary group-hover:text-white transition-all duration-500">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Avg Marks</p>
                <p className="text-4xl font-black text-gray-900">{student["Avg Marks"]}/100</p>
              </div>
              <div className="scholar-card text-center group">
                <div className="w-16 h-16 bg-scholar-bg rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-scholar-accent group-hover:text-white transition-all duration-500">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Assignments</p>
                <p className="text-4xl font-black text-gray-900">{student["Assignments (/10)"]}/10</p>
              </div>
            </div>

            {/* Block 2.5: Subject-Wise Performance & Improvement Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="scholar-card space-y-6">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-2 h-6 bg-scholar-primary rounded-full"></div>
                  Subject-Wise Marks
                </h3>
                <div className="space-y-4">
                  {subjectCols.map((col) => {
                    const score = Number(student[col]) || 0;
                    const name = getCleanSubjectName(col);
                    return (
                      <div key={col} className="space-y-2">
                        <div className="flex justify-between items-end px-2">
                          <span className="text-xs font-bold text-gray-700">{name}</span>
                          <span className={cn(
                            "text-sm font-black",
                            score >= 75 ? "text-emerald-600" : score >= 60 ? "text-scholar-primary" : score >= 40 ? "text-orange-600" : "text-red-600"
                          )}>
                            {score}/100
                          </span>
                        </div>
                        <div className="w-full h-3 bg-scholar-bg rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full shadow-lg",
                              score >= 75 ? "bg-emerald-500" : score >= 60 ? "bg-scholar-primary" : score >= 40 ? "bg-orange-500" : "bg-red-500"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-8">
                {/* Improvement Tracker */}
                <div className="scholar-card space-y-6">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-2 h-6 bg-scholar-secondary rounded-full"></div>
                    Improvement Tracker
                  </h3>
                  {student.History && student.History.length > 0 ? (
                    <div className="space-y-6">
                      {(() => {
                        const lastHistory = student.History[student.History.length - 1];
                        const currentAvg = student["Avg Marks"] || 0;
                        const currentAtt = student["Attendance (%)"] || 0;
                        
                        const getTrendIcon = (current: number, previous: number) => {
                          if (current > previous) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
                          if (current < previous) return <TrendingDown className="w-5 h-5 text-red-500" />;
                          return <Minus className="w-5 h-5 text-gray-400" />;
                        };

                        const getTrendColor = (current: number, previous: number) => {
                          if (current > previous) return "text-emerald-600 bg-emerald-50 border-emerald-100";
                          if (current < previous) return "text-red-600 bg-red-50 border-red-100";
                          return "text-gray-600 bg-gray-50 border-gray-100";
                        };

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={cn("p-4 rounded-2xl border transition-all", getTrendColor(currentAvg, lastHistory.avgMarks))}>
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Avg Marks</p>
                                {getTrendIcon(currentAvg, lastHistory.avgMarks)}
                              </div>
                              <p className="text-2xl font-black">{currentAvg}</p>
                              <p className="text-[10px] font-bold opacity-80 mt-1">Prev: {lastHistory.avgMarks}</p>
                            </div>
                            <div className={cn("p-4 rounded-2xl border transition-all", getTrendColor(currentAtt, lastHistory.attendance))}>
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Attendance</p>
                                {getTrendIcon(currentAtt, lastHistory.attendance)}
                              </div>
                              <p className="text-2xl font-black">{currentAtt}%</p>
                              <p className="text-[10px] font-bold opacity-80 mt-1">Prev: {lastHistory.attendance}%</p>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="p-4 bg-scholar-bg/50 rounded-2xl border border-scholar-bg">
                        <p className="text-xs font-bold text-gray-600 italic">
                          * Comparison based on data upload from {student.History[student.History.length - 1].date}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-scholar-bg/30 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm font-bold text-gray-400 italic">No historical data available yet. Trends will appear after the next data upload.</p>
                    </div>
                  )}
                </div>

                {/* Quick Improvement Tips */}
                <div className="scholar-card space-y-6">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-2 h-6 bg-scholar-accent rounded-full"></div>
                    Improvement Areas
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      const improvements = [];
                      if (student["Attendance (%)"] < 75) improvements.push("Boost attendance to 75%+");
                      if (student["Assignments (/10)"] < 7) improvements.push("Complete pending assignments");
                      
                      const weakSubjects = subjectCols
                        .filter(col => (Number(student[col]) || 0) < 60)
                        .map(col => getCleanSubjectName(col));

                      weakSubjects.forEach(name => improvements.push(`Improve ${name} score`));

                      if (improvements.length === 0) return <p className="text-xs font-bold text-emerald-600">All metrics are optimal!</p>;

                      return improvements.map((imp, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs font-bold text-gray-600">
                          <div className="w-1.5 h-1.5 bg-scholar-secondary rounded-full"></div>
                          {imp}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Block 2.6: Academic Progress Trends (Chart) */}
            {student.History && student.History.length > 0 && (
              <div className="scholar-card space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-3 h-8 bg-scholar-primary rounded-full"></div>
                    Academic Progress Trends
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-scholar-primary"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg Marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-scholar-secondary"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Attendance</span>
                    </div>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        ...student.History.map(h => ({
                          date: h.date,
                          marks: h.avgMarks,
                          attendance: h.attendance
                        })),
                        {
                          date: "Current",
                          marks: student["Avg Marks"] || 0,
                          attendance: student["Attendance (%)"] || 0
                        }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7a6ad8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7a6ad8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f06292" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f06292" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f0fe" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '20px', 
                          border: 'none', 
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          padding: '15px'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                        labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '5px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="marks" 
                        name="Avg Marks"
                        stroke="#7a6ad8" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorMarks)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="attendance" 
                        name="Attendance"
                        stroke="#f06292" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorAtt)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Block 3: Risk Status */}
            <div className="flex justify-center">
              {student["Predicted Risk"] === "High Risk" && (
                <div className="w-full max-w-3xl p-8 bg-red-500 text-white rounded-scholar text-center shadow-2xl shadow-red-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <p className="text-xs font-bold uppercase tracking-[0.4em] mb-2 opacity-80">Academic Status</p>
                  <h4 className="text-3xl font-black tracking-tight">🔴 CRITICAL: HIGH RISK</h4>
                  <p className="mt-4 text-sm font-medium opacity-90 max-w-xl mx-auto">
                    Your current performance metrics indicate a high risk of academic dropout. Please schedule a meeting with your mentor immediately to discuss your recovery plan.
                  </p>
                </div>
              )}
              {student["Predicted Risk"] === "Medium Risk" && (
                <div className="w-full max-w-3xl p-8 bg-orange-500 text-white rounded-scholar text-center shadow-2xl shadow-orange-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <p className="text-xs font-bold uppercase tracking-[0.4em] mb-2 opacity-80">Academic Status</p>
                  <h4 className="text-3xl font-black tracking-tight">🟡 ATTENTION: MEDIUM RISK</h4>
                  <p className="mt-4 text-sm font-medium opacity-90 max-w-xl mx-auto">
                    There is room for improvement in your current academic journey. Let's work together to strengthen your foundation and get back on track.
                  </p>
                </div>
              )}
              {student["Predicted Risk"] === "Low Risk" && (
                <div className="w-full max-w-3xl p-8 bg-emerald-500 text-white rounded-scholar text-center shadow-2xl shadow-emerald-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <p className="text-xs font-bold uppercase tracking-[0.4em] mb-2 opacity-80">Academic Status</p>
                  <h4 className="text-3xl font-black tracking-tight">🟢 EXCELLENT: LOW RISK</h4>
                  <p className="mt-4 text-sm font-medium opacity-90 max-w-xl mx-auto">
                    You are performing exceptionally well! Continue maintaining your consistency and focus to achieve your academic goals.
                  </p>
                </div>
              )}
            </div>

            {/* Block 4: AI Recovery Plan */}
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-scholar-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-scholar-primary/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                Your Personalized Recovery Plan
              </h3>

              {student["Predicted Risk"] === "Low Risk" ? (
                <div className="scholar-card !bg-emerald-50 border-none text-emerald-800 p-10 text-center space-y-4">
                  <div className="text-5xl">🚀</div>
                  <h4 className="text-2xl font-black">You're on the Right Track!</h4>
                  <p className="text-sm font-medium opacity-80 max-w-lg mx-auto">
                    Since you are currently at low risk, you don't need a specific recovery plan. Keep maintaining your attendance and performance to stay ahead!
                  </p>
                </div>
              ) : !geminiKey ? (
                <div className="scholar-card !bg-orange-50 border-none text-orange-800 p-10 text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
                  <h4 className="text-2xl font-black">AI Insights Unavailable</h4>
                  <p className="text-sm font-medium opacity-80 max-w-lg mx-auto">
                    To generate your personalized AI-driven recovery plan, please ensure the faculty has configured the Gemini API Key in the sidebar.
                  </p>
                </div>
              ) : loadingPlan ? (
                <div className="scholar-card flex flex-col items-center justify-center p-20 space-y-6">
                  <Loader2 className="w-12 h-12 animate-spin text-scholar-primary" />
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Crafting your roadmap...</p>
                </div>
              ) : plan ? (
                <div className="space-y-8">
                  <div className="scholar-card !p-10 !bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-scholar-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="prose prose-scholar max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-medium italic">
                      {plan}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={downloadPlan}
                      className="scholar-btn-primary flex items-center gap-3 !px-10 !py-4 text-lg"
                    >
                      <Download className="w-5 h-5" /> Download My Roadmap
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Block 5: Study Materials */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-scholar-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-scholar-secondary/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  Recommended Study Materials
                </h3>
                <span className="text-[10px] font-extrabold text-scholar-secondary bg-scholar-secondary/10 px-4 py-2 rounded-full uppercase tracking-widest">
                  Tailored to your performance
                </span>
              </div>

              {recommendedMaterials.length === 0 ? (
                <div className="scholar-card !bg-gray-50 border-none text-gray-500 p-10 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest mb-2">No Materials Found</p>
                  <p className="text-xs font-medium opacity-80">
                    {student && student["Avg Marks"] && student["Avg Marks"] >= 75 
                      ? "Great job! You're performing well across all subjects. No specific remedial materials are required at this time."
                      : "No specific materials have been uploaded for your current performance level yet. Check back later."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedMaterials.map((material, idx) => (
                    <div key={idx} className="scholar-card group hover:bg-scholar-primary hover:text-white transition-all duration-500">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-scholar-primary group-hover:text-white/80 uppercase tracking-widest transition-colors">{material.subject}</p>
                          <p className="text-xl font-black tracking-tight">📄 {material.title}</p>
                        </div>
                        <div className="w-10 h-10 bg-scholar-bg group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                          {material.type === "External Link" ? <LinkIcon className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold opacity-60 mb-6">Uploaded on {material.uploaded_on}</p>
                      
                      {material.type === "External Link" ? (
                        <a 
                          href={material.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => handleResourceClick(`Material: ${material.title}`, material.link || "")}
                          className="w-full py-3 bg-scholar-bg group-hover:bg-white group-hover:text-scholar-primary rounded-full text-xs font-black uppercase tracking-widest text-center block transition-all"
                        >
                          Open Resource
                        </a>
                      ) : (
                        <button 
                          onClick={() => {
                            handleDownload(material);
                            handleResourceClick(`Download: ${material.title}`, material.file_name || "File");
                          }}
                          className="w-full py-3 bg-scholar-bg group-hover:bg-white group-hover:text-scholar-primary rounded-full text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Download File
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block 6: Free Course Library */}
            <div className="space-y-10">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-scholar-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-scholar-accent/20">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  Global Learning Library
                </h3>
                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase tracking-widest">Free resources from top universities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {subjectCols.map((col) => {
                  const name = getCleanSubjectName(col);
                  const links = getSmartLinks(col);
                  return (
                    <div key={col} className="scholar-card !p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-scholar-bg rounded-xl flex items-center justify-center text-scholar-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{name}</p>
                      </div>
                      <div className="space-y-3">
                        {links.map((link, lIdx) => (
                          <a 
                            key={lIdx}
                            href={link.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={() => handleResourceClick(link.name, link.link)}
                            className="flex items-center justify-between p-4 bg-scholar-bg/50 hover:bg-scholar-primary hover:text-white rounded-2xl text-xs font-bold transition-all group"
                          >
                            {link.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

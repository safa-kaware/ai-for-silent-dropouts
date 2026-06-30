import { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";
import { cn } from "../lib/utils";
import { Sparkles, Download, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface RecoveryPlanProps {
  students: Student[];
  geminiKey: string;
}

export default function RecoveryPlan({ students, geminiKey }: RecoveryPlanProps) {
  const [selectedStudentName, setSelectedStudentName] = useState(students[0]?.Name || "");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedStudent = students.find(s => s.Name === selectedStudentName);

  const generatePlan = async () => {
    if (!geminiKey) {
      setError("⚠️ Please enter your Gemini API Key in the sidebar first.");
      return;
    }

    if (!selectedStudent) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const SUBJECT_COLS = Object.keys(selectedStudent).filter(key => key.includes("(/100)"));
      const subjectBreakdown = SUBJECT_COLS.map(s => `  - ${s.replace(' (/100)', '')}: ${selectedStudent[s as keyof Student]}/100`).join("\n");
      const weakestSubject = selectedStudent["Weakest Subject"]?.replace(' (/100)', '');
      const weakestScore = selectedStudent["Weakest Score"];

      const prompt = `You are an academic counselor at a university in India. A student named ${selectedStudent.Name} 
      is currently flagged as ${selectedStudent["Predicted Risk"]}.

      Their detailed academic data is:
      - Attendance: ${selectedStudent["Attendance (%)"]}%
      - Assignment Score: ${selectedStudent["Assignments (/10)"]}/10
      - Subject-wise Marks:
      ${subjectBreakdown}

      Their WEAKEST subject is: ${weakestSubject} (scored only ${weakestScore}/100).

      Create a detailed, practical, and motivating 4-week academic recovery plan. 
      The plan must PRIMARILY focus on improving ${weakestSubject} since that is where 
      the student needs the most help. Also address attendance and assignment completion.

      Structure it exactly as follows:

      Week 1 - Assessment & Foundation (Focus: ${weakestSubject}):
      (List 4-5 specific daily actions — at least 3 must be about ${weakestSubject})

      Week 2 - Building Momentum:
      (List 4-5 specific daily actions — include specific ${weakestSubject} topics to study)

      Week 3 - Consolidation & Practice:
      (List 4-5 specific daily actions — include practice problems or revision strategies for ${weakestSubject})

      Week 4 - Evaluation & Sustain:
      (List 4-5 specific daily actions — include self-assessment for ${weakestSubject})

      End with a short motivational message (2 sentences max) addressed to ${selectedStudent.Name} by name.
      Be specific, practical, and empathetic. Name actual topics, techniques, and resources relevant 
      to ${weakestSubject} at the university level in India.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "Failed to generate plan.";
      setPlan(text);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      if (err.message?.includes("429") || err.message?.includes("quota")) {
        // Fallback plan
        const fallback = `### 📋 Recovery Plan for ${selectedStudent.Name} (Fallback Template)
        
Week 1 - Assessment & Foundation:
- Review all missed lectures and notes for the past month.
- Identify core topics where marks were lost in recent tests.
- Set a fixed daily study schedule (at least 2 hours).
- Meet with subject teachers to clarify doubts.
- Ensure 100% attendance for all upcoming classes this week.

Week 2 - Building Momentum:
- Complete all pending assignments and submit them.
- Practice 5-10 problems/questions from the weakest subject daily.
- Join a peer study group for collaborative learning.
- Minimize distractions (phone/social media) during study hours.
- Maintain consistent attendance and participate in class discussions.

Week 3 - Consolidation:
- Take a mock test to evaluate progress in weak areas.
- Revise all chapters covered in the first two weeks.
- Start preparing for upcoming mid-term or end-term exams.
- Focus on time management during problem-solving.
- Continue attending all classes without fail.

Week 4 - Evaluation & Sustain:
- Review the mock test results and fix remaining gaps.
- Prepare a long-term study plan to maintain performance.
- Seek final feedback from the mentor or counselor.
- Celebrate small wins and stay motivated.
- Commit to the new routine for the rest of the semester.

Motivational Message:
${selectedStudent.Name}, you have the potential to turn this around. Stay focused and consistent, and you will see the results!`;
        setPlan(fallback);
        setError("⚠️ AI servers are currently busy. Generated a smart fallback template.");
      } else {
        setError(`AI Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = () => {
    if (!plan) return;
    const element = document.createElement("a");
    const file = new Blob([plan], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Recovery_Plan_${selectedStudentName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          AI <span className="text-scholar-primary">Recovery</span> Plans
        </h3>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Generate personalized 4-week academic roadmaps powered by AI to help students get back on track.
        </p>
      </div>
      
      <div className="scholar-card !p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Student for Plan</label>
            <select
              value={selectedStudentName}
              onChange={(e) => setSelectedStudentName(e.target.value)}
              className="scholar-input !py-3 !px-6 min-w-[300px]"
            >
              {students.map((s, idx) => (
                <option key={idx} value={s.Name}>{s.Name}</option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Risk</p>
                <p className={cn(
                  "text-lg font-black",
                  selectedStudent["Predicted Risk"] === "High Risk" ? "text-scholar-primary" :
                  selectedStudent["Predicted Risk"] === "Medium Risk" ? "text-scholar-secondary" :
                  "text-scholar-accent"
                )}>
                  {selectedStudent["Predicted Risk"]}
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg",
                selectedStudent["Predicted Risk"] === "High Risk" ? "bg-scholar-primary shadow-scholar-primary/20" :
                selectedStudent["Predicted Risk"] === "Medium Risk" ? "bg-scholar-secondary shadow-scholar-secondary/20" :
                "bg-scholar-accent shadow-scholar-accent/20"
              )}>
                {selectedStudent["Predicted Risk"] === "High Risk" ? "🔴" : 
                 selectedStudent["Predicted Risk"] === "Medium Risk" ? "🟡" : "🟢"}
              </div>
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-scholar-bg p-8 rounded-scholar border-2 border-gray-100 text-center group hover:border-scholar-primary transition-all duration-300">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Attendance</p>
                <p className="text-4xl font-black text-gray-900">{selectedStudent["Attendance (%)"]}%</p>
              </div>
              <div className="bg-scholar-bg p-8 rounded-scholar border-2 border-gray-100 text-center group hover:border-scholar-secondary transition-all duration-300">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Avg Marks</p>
                <p className="text-4xl font-black text-gray-900">{selectedStudent["Avg Marks"]}<span className="text-lg opacity-30 ml-1">/100</span></p>
              </div>
              <div className="bg-scholar-bg p-8 rounded-scholar border-2 border-gray-100 text-center group hover:border-scholar-accent transition-all duration-300">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assignments</p>
                <p className="text-4xl font-black text-gray-900">{selectedStudent["Assignments (/10)"]}<span className="text-lg opacity-30 ml-1">/10</span></p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-scholar-accent rounded-full"></div>
                <h5 className="text-xl font-black text-gray-900">Subject Performance</h5>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.keys(selectedStudent).filter(key => key.includes("(/100)")).map((subject, idx) => {
                  const score = Number(selectedStudent[subject as keyof Student]) || 0;
                  const label = subject.replace(' (/100)', '');
                  return (
                    <div key={idx} className="bg-white p-4 rounded-scholar border-2 border-gray-50 text-center shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-xl font-black text-gray-900">{score}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-8 bg-scholar-primary/5 border-2 border-scholar-primary/20 rounded-scholar flex items-start gap-6">
              <div className="w-14 h-14 bg-scholar-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-scholar-primary/20 shrink-0">
                ⚠️
              </div>
              <div className="space-y-2">
                <h6 className="text-lg font-black text-gray-900">Primary Focus Area</h6>
                <p className="text-gray-600 font-medium leading-relaxed">
                  The recovery plan will be optimized to address <span className="text-scholar-primary font-black underline decoration-scholar-primary decoration-2 underline-offset-4">{selectedStudent["Weakest Subject"]?.replace(' (/100)', '')}</span> where the current score is <span className="font-black text-gray-900">{selectedStudent["Weakest Score"]}/100</span>.
                </p>
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={loading}
              className="scholar-btn-primary !w-full !py-5 !text-lg flex items-center justify-center gap-3 shadow-2xl shadow-scholar-primary/30"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              Generate Personalized AI Recovery Plan
            </button>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-8 p-6 rounded-scholar text-sm font-bold flex items-center gap-4 border-2",
              error.startsWith("⚠️") ? "bg-scholar-secondary/5 text-scholar-secondary border-scholar-secondary/10" : "bg-red-50 text-red-700 border-red-100"
            )}
          >
            <AlertTriangle className="w-6 h-6 shrink-0" />
            {error}
          </motion.div>
        )}

        {plan && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-16 space-y-8"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-gray-900">📋 Recovery Plan for {selectedStudentName}</h3>
              <button
                onClick={downloadPlan}
                className="scholar-btn-secondary !py-2 !px-6 !text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download TXT
              </button>
            </div>
            <div className="p-10 bg-scholar-bg rounded-scholar border-2 border-gray-100 text-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner text-lg font-medium">
              {plan}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

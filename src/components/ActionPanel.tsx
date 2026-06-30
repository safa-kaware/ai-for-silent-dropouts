import { useState } from "react";
import { Search, Mail, Smartphone, Sparkles, Send, AlertTriangle, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Student } from "../types";
import { cn } from "../lib/utils";

interface ActionPanelProps {
  students: Student[];
  geminiKey: string;
  twSid: string;
  twToken: string;
  twPhone: string;
}

export default function ActionPanel({ students, geminiKey, twSid, twToken, twPhone }: ActionPanelProps) {
  const [search, setSearch] = useState("");
  const [loadingEmail, setLoadingEmail] = useState<number | null>(null);
  const [loadingSms, setLoadingSms] = useState<number | null>(null);
  const [aiDrafts, setAiDrafts] = useState<Record<number, string>>({});
  const [statusMessages, setStatusMessages] = useState<Record<number, { type: "success" | "error" | "warning", text: string }>>({});

  const filteredStudents = students.filter(s => 
    (s.Name || "").toLowerCase().includes(search.toLowerCase())
  );

  const draftAiEmail = async (student: Student) => {
    if (!geminiKey) {
      setStatusMessages(prev => ({ ...prev, [student["Roll No"]]: { type: "warning", text: "⚠️ Enter Gemini API Key in the Sidebar first!" } }));
      return;
    }

    setLoadingEmail(student["Roll No"]);
    setStatusMessages(prev => {
      const next = { ...prev };
      delete next[student["Roll No"]];
      return next;
    });

    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = `Write a brief, polite, and empathetic email to a university student named ${student.Name}. 
      Their current attendance is ${student["Attendance (%)"]}% and marks are ${student["Avg Marks"]}/100. 
      Their academic status is flagged as ${student["Predicted Risk"]}. Ask them to schedule a meeting with their 
      mentor to discuss support options. Keep it strictly under 4 sentences.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const draft = response.text || "Failed to generate draft.";
      setAiDrafts(prev => ({ ...prev, [student["Roll No"]]: draft }));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        setStatusMessages(prev => ({ ...prev, [student["Roll No"]]: { type: "warning", text: "⚠️ AI servers are currently busy. Generating smart fallback template..." } }));
        const fallback = `Dear ${student.Name},\n\nI am writing to check in on your academic progress. Your current attendance is ${student["Attendance (%)"]}% and your marks are ${student["Avg Marks"]}/100, which has flagged your status as ${student["Predicted Risk"]}. Please schedule a meeting with me to discuss how we can support your success.\n\nBest regards,\nYour Mentor`;
        setAiDrafts(prev => ({ ...prev, [student["Roll No"]]: fallback }));
      } else {
        setStatusMessages(prev => ({ ...prev, [student["Roll No"]]: { type: "error", text: `Error: ${error.message}` } }));
      }
    } finally {
      setLoadingEmail(null);
    }
  };

  const sendSms = async (student: Student) => {
    if (!twSid || !twToken || !twPhone) {
      setStatusMessages(prev => ({ ...prev, [student["Roll No"]]: { type: "warning", text: "⚠️ Enter Twilio Credentials in the Sidebar!" } }));
      return;
    }

    setLoadingSms(student["Roll No"]);
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sid: twSid,
          token: twToken,
          from: twPhone,
          to: `+91${student["Parent Phone"]}`,
          body: `URGENT ALERT: ${student.Name}'s academic risk level is ${student["Predicted Risk"]}. Please check their portal.`
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatusMessages(prev => ({ ...prev, [student["Roll No"]]: { type: "success", text: `SMS Sent to +91${student["Parent Phone"]}!` } }));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setStatusMessages(prev => ({ ...prev, [student["Roll No"]]: { type: "error", text: `Twilio Error: ${error.message}` } }));
    } finally {
      setLoadingSms(null);
    }
  };

  const getGmailLink = (student: Student, body: string) => {
    const subject = `Checking in regarding your progress, ${student.Name}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(student.Email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          Mentor <span className="text-scholar-primary">Action</span> Panel
        </h3>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Take immediate action with AI-powered communication tools. Send personalized emails and SMS alerts to students and parents.
        </p>
      </div>
      
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-scholar-primary w-6 h-6" />
        <input
          type="text"
          placeholder="Search for a student to take action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="scholar-input !pl-16 !py-5 !text-lg shadow-xl shadow-scholar-primary/5"
        />
      </div>

      <div className="space-y-8">
        {filteredStudents.length === 0 ? (
          <div className="scholar-card !bg-scholar-primary/5 !border-scholar-primary/20 text-center py-20">
            <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-scholar-primary opacity-50" />
            <p className="text-2xl font-black text-gray-900">No students found</p>
            <p className="text-gray-500 font-medium mt-2">Try searching with a different name</p>
          </div>
        ) : (
          filteredStudents.map((student, idx) => (
            <div key={`${student["Roll No"]}-${idx}`} className="scholar-card group hover:-translate-y-1 transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1 flex items-center gap-6">
                  <div className="w-16 h-16 bg-scholar-bg rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
                    👤
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 leading-tight">{student.Name}</h4>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest mt-1">Roll No: {student["Roll No"] || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className={cn(
                    "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest",
                    student["Predicted Risk"] === "High Risk" ? "bg-scholar-primary/10 text-scholar-primary" :
                    student["Predicted Risk"] === "Medium Risk" ? "bg-scholar-secondary/10 text-scholar-secondary" :
                    "bg-scholar-accent/10 text-scholar-accent"
                  )}>
                    {student["Predicted Risk"]}
                  </div>

                  <div className="h-8 w-px bg-gray-100 hidden lg:block" />

                  <button
                    onClick={() => draftAiEmail(student)}
                    disabled={loadingEmail === student["Roll No"]}
                    className="scholar-btn-secondary !py-3 !px-6 !text-xs flex items-center gap-2"
                  >
                    {loadingEmail === student["Roll No"] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Draft AI Email
                  </button>

                  <button
                    onClick={() => sendSms(student)}
                    disabled={loadingSms === student["Roll No"]}
                    className="scholar-btn-primary !py-3 !px-6 !text-xs flex items-center gap-2"
                  >
                    {loadingSms === student["Roll No"] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                    SMS Parent
                  </button>
                </div>
              </div>

              {statusMessages[student["Roll No"]] && (
                <div className={cn(
                  "mt-6 p-4 rounded-scholar text-sm font-bold flex items-center gap-3 border-2",
                  statusMessages[student["Roll No"]].type === "success" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                  statusMessages[student["Roll No"]].type === "error" && "bg-red-50 text-red-700 border-red-100",
                  statusMessages[student["Roll No"]].type === "warning" && "bg-scholar-secondary/5 text-scholar-secondary border-scholar-secondary/10"
                )}
                >
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  {statusMessages[student["Roll No"]].text}
                </div>
              )}

              {aiDrafts[student["Roll No"]] && (
                <div className="mt-8 p-8 bg-scholar-bg rounded-scholar border-2 border-dashed border-scholar-accent/30 space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-scholar-accent rounded-lg flex items-center justify-center text-white text-sm">
                      ✨
                    </div>
                    <span className="text-xs font-black text-scholar-accent uppercase tracking-widest">AI Generated Draft</span>
                  </div>
                  <div className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap italic text-lg">
                    "{aiDrafts[student["Roll No"]]}"
                  </div>
                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <a
                      href={getGmailLink(student, aiDrafts[student["Roll No"]])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="scholar-btn-accent !py-3 !px-8 flex items-center gap-3 shadow-xl shadow-scholar-accent/20"
                    >
                      <Mail className="w-5 h-5" />
                      Send via Gmail
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useState, FormEvent } from "react";
import { Calendar, Plus, History, Download, User, CheckCircle, XCircle, Clock, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Student, FollowUpLog, ResourceAccessLog } from "../types";
import { cn } from "../lib/utils";

interface FollowUpTrackerProps {
  students: Student[];
  logs: FollowUpLog[];
  onLog: (log: FollowUpLog) => void;
  onClearLogs?: () => void;
  onClearResourceLogs?: () => void;
  resourceLogs?: ResourceAccessLog[];
}

export default function FollowUpTracker({ 
  students, 
  logs, 
  onLog, 
  onClearLogs, 
  onClearResourceLogs, 
  resourceLogs = [] 
}: FollowUpTrackerProps) {
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.Name || "");
  const [action, setAction] = useState("📞 Phone Call to Student");
  const [notes, setNotes] = useState("");
  const [followupDate, setFollowupDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("🔴 Still at Risk");

  const [historyFilter, setHistoryFilter] = useState("All Students");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      const newLog: FollowUpLog = {
        student: selectedStudent,
        action,
        notes,
        followup_date: followupDate,
        status,
        logged_on: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      };
      onLog(newLog);
      setNotes("");
    }
  };

  const filteredLogs = logs.filter(l => historyFilter === "All Students" || l.student === historyFilter).reverse();

  const exportCSV = () => {
    const headers = ["Student", "Action", "Notes", "Follow-up Date", "Status", "Logged On"];
    const rows = logs.map(l => [l.student, l.action, l.notes.replace(/,/g, ";"), l.followup_date, l.status, l.logged_on]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Intervention_Log.csv";
    link.click();
  };

  const actions = [
    "📞 Phone Call to Student",
    "📞 Phone Call to Parent",
    "📧 Email Sent to Student",
    "📧 Email Sent to Parent",
    "🤝 In-Person Meeting with Student",
    "📱 SMS Sent to Parent",
    "📋 Counseling Session",
    "📚 Study Plan Shared",
    "📄 Study Material Shared",
    "🔔 Warning Issued",
    "✅ Student Responded Positively",
    "❌ No Response from Student"
  ];

  const statuses = [
    "🔴 Still at Risk",
    "🟡 Showing Some Improvement",
    "🟢 Recovered / Back on Track",
    "⏳ Awaiting Response"
  ];

  return (
    <div className="space-y-16 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          Intervention <span className="text-scholar-primary">Tracker</span>
        </h3>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Monitor mentor-student interactions and track academic recovery progress in real-time.
        </p>
      </div>

      {/* Section A: Log a New Action */}
      <div className="scholar-card !p-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-scholar-primary rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-scholar-primary/20">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="text-2xl font-black text-gray-900">Log New Intervention</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="scholar-input !py-3"
              >
                {students.map(s => <option key={s.Name} value={s.Name}>{s.Name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Action Taken</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="scholar-input !py-3"
              >
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Detailed Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the interaction and student's response..."
              rows={4}
              className="scholar-input !py-4 !rounded-3xl resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Next Follow-up Date</label>
              <input
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                className="scholar-input !py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Current Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="scholar-input !py-3"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="scholar-btn-primary !w-full !py-5 !text-lg shadow-xl shadow-scholar-primary/20"
          >
            Save Intervention to History
          </button>
        </form>
      </div>

      {/* Section B: View Intervention History */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-scholar-secondary rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-scholar-secondary/20">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-black text-gray-900">Intervention History</h4>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="scholar-input !py-2 !px-4 !text-xs !w-48"
            >
              <option value="All Students">All Students</option>
              {students.map(s => <option key={s.Name} value={s.Name}>{s.Name}</option>)}
            </select>
            {logs.length > 0 && onClearLogs && (
              <button 
                onClick={onClearLogs}
                className="scholar-btn-secondary !py-2 !px-4 !text-xs !bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="scholar-card !bg-scholar-bg !border-dashed !border-gray-200 text-center py-20">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-black text-gray-400">No interventions logged for this selection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredLogs.map((entry, idx) => (
              <div key={idx} className="scholar-card group hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-scholar-bg rounded-xl flex items-center justify-center text-lg shadow-inner">
                        👤
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900 leading-tight">{entry.student}</p>
                        <p className="text-xs font-black text-scholar-primary uppercase tracking-widest mt-1">{entry.action}</p>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="p-6 bg-scholar-bg rounded-scholar border-2 border-gray-50 text-gray-600 font-medium italic relative">
                        <div className="absolute top-0 left-6 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-scholar-primary shadow-sm border border-gray-100">
                          "
                        </div>
                        {entry.notes}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <Clock className="w-4 h-4 text-scholar-secondary" />
                        Logged: {entry.logged_on}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <Calendar className="w-4 h-4 text-scholar-accent" />
                        Next Follow-up: {entry.followup_date}
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-sm",
                    entry.status.includes("🔴") && "bg-red-50 text-red-600 border border-red-100",
                    entry.status.includes("🟡") && "bg-scholar-secondary/10 text-scholar-secondary border border-scholar-secondary/20",
                    entry.status.includes("🟢") && "bg-scholar-accent/10 text-scholar-accent border border-scholar-accent/20",
                    entry.status.includes("⏳") && "bg-gray-100 text-gray-600 border border-gray-200"
                  )}>
                    {entry.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section C: Resource Access History */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-scholar-accent rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-scholar-accent/20">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-black text-gray-900">Resource Access Logs</h4>
          </div>
          {resourceLogs.length > 0 && onClearResourceLogs && (
            <button 
              onClick={onClearResourceLogs}
              className="scholar-btn-secondary !py-2 !px-4 !text-xs !bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100"
            >
              Clear Logs
            </button>
          )}
        </div>

        {resourceLogs.length === 0 ? (
          <div className="scholar-card !bg-scholar-bg !border-dashed !border-gray-200 text-center py-20">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-black text-gray-400">No resource access recorded yet</p>
          </div>
        ) : (
          <div className="scholar-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-scholar-bg border-b-2 border-gray-100">
                    <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Student</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Resource Title</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-500 uppercase tracking-widest">Accessed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...resourceLogs].reverse().map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-scholar-bg rounded-lg flex items-center justify-center text-sm shadow-inner group-hover:bg-white transition-colors">
                            👤
                          </div>
                          <span className="text-sm font-black text-gray-900">{log.studentName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <a 
                          href={log.resourceLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-bold text-scholar-secondary hover:text-scholar-primary flex items-center gap-2 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          {log.resourceTitle}
                        </a>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{log.accessedAt}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section D: Export Log */}
      {logs.length > 0 && (
        <div className="flex justify-center pt-8">
          <button
            onClick={exportCSV}
            className="scholar-btn-accent !py-4 !px-10 !text-lg flex items-center gap-3 shadow-2xl shadow-scholar-accent/20"
          >
            <Download className="w-6 h-6" />
            Export Full Intervention Log (CSV)
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { Download, Search, Filter } from "lucide-react";
import { Student, RiskLevel } from "../types";
import { cn } from "../lib/utils";

interface DashboardProps {
  students: Student[];
}

export default function Dashboard({ students }: DashboardProps) {
  const [filter, setFilter] = useState<RiskLevel | "All">("All");

  const filteredStudents = useMemo(() => {
    if (filter === "All") return students;
    return students.filter(s => s["Predicted Risk"] === filter);
  }, [students, filter]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      high: students.filter(s => s["Predicted Risk"] === "High Risk").length,
      medium: students.filter(s => s["Predicted Risk"] === "Medium Risk").length,
      low: students.filter(s => s["Predicted Risk"] === "Low Risk").length,
    };
  }, [students]);

  const downloadCSV = () => {
    const headers = ["Name", "Roll No", "Attendance (%)", "Avg Marks", "Weakest Subject", "Weakest Score", "Predicted Risk"];
    const rows = filteredStudents.map(s => [
      s["Name"],
      s["Roll No"],
      s["Attendance (%)"],
      s["Avg Marks"],
      s["Weakest Subject"],
      s["Weakest Score"],
      s["Predicted Risk"]
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filter}_Report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      {/* Metric Cards */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-8 bg-scholar-primary rounded-full"></span>
          Class Overview Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="scholar-card !p-6">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Total Students</p>
            <p className="text-4xl font-black text-gray-900">{stats.total}</p>
          </div>
          <div className="scholar-card !p-6 border-b-4 border-red-500">
            <p className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest mb-1">🔴 High Risk</p>
            <p className="text-4xl font-black text-red-600">{stats.high}</p>
          </div>
          <div className="scholar-card !p-6 border-b-4 border-orange-500">
            <p className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest mb-1">🟡 Medium Risk</p>
            <p className="text-4xl font-black text-orange-600">{stats.medium}</p>
          </div>
          <div className="scholar-card !p-6 border-b-4 border-emerald-500">
            <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-1">🟢 Low Risk</p>
            <p className="text-4xl font-black text-emerald-600">{stats.low}</p>
          </div>
        </div>
      </div>

      {/* Student Roster & Filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-8 bg-scholar-secondary rounded-full"></span>
            Student Roster & Filters
          </h3>
          <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-lg">
            {["All", "High Risk", "Medium Risk", "Low Risk"].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option as any)}
                className={cn(
                  "px-6 py-2 text-xs font-bold rounded-full transition-all duration-300",
                  filter === option 
                    ? "bg-scholar-primary text-white shadow-lg shadow-scholar-primary/20" 
                    : "text-gray-500 hover:text-scholar-primary"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="scholar-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-scholar-bg/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Roll No</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Attendance</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Avg Marks</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Weakest Subject</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student, idx) => (
                  <tr key={`${student["Roll No"]}-${idx}`} className="hover:bg-scholar-bg/30 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-gray-900 group-hover:text-scholar-primary transition-colors">{student["Name"]}</td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">{isNaN(Number(student["Roll No"])) ? "N/A" : student["Roll No"]}</td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              student["Attendance (%)"] >= 75 ? "bg-emerald-500" : student["Attendance (%)"] >= 60 ? "bg-orange-500" : "bg-red-500"
                            )}
                            style={{ width: `${student["Attendance (%)"]}%` }}
                          />
                        </div>
                        {student["Attendance (%)"]}%
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">{student["Avg Marks"]}/100</td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium italic">{student["Weakest Subject"]?.replace(' (/100)', '')}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm",
                        student["Predicted Risk"] === "High Risk" && "bg-red-50 text-red-600",
                        student["Predicted Risk"] === "Medium Risk" && "bg-orange-50 text-orange-600",
                        student["Predicted Risk"] === "Low Risk" && "bg-emerald-50 text-emerald-600"
                      )}>
                        {student["Predicted Risk"]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={downloadCSV}
            className="scholar-btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

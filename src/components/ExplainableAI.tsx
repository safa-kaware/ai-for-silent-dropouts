import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Student } from "../types";
import { cn } from "../lib/utils";

interface ExplainableAIProps {
  students: Student[];
}

export default function ExplainableAI({ students }: ExplainableAIProps) {
  const [selectedStudentName, setSelectedStudentName] = useState(students[0]?.Name || "");

  const selectedStudent = useMemo(() => {
    return students.find(s => s.Name === selectedStudentName);
  }, [students, selectedStudentName]);

  const SUBJECT_COLS = ['Maths (/100)', 'Physics (/100)', 'Chemistry (/100)', 'Computer Science (/100)', 'English (/100)'];

  const classAverages = useMemo(() => {
    const total = students.length;
    if (total === 0) return { attendance: 0, assignments: 0, subjects: {} as Record<string, number> };
    
    const subjectAvgs: Record<string, number> = {};
    SUBJECT_COLS.forEach(s => {
      subjectAvgs[s] = students.reduce((acc, st) => acc + (Number(st[s as keyof Student]) || 0), 0) / total;
    });

    return {
      attendance: students.reduce((acc, s) => acc + s["Attendance (%)"], 0) / total,
      assignments: students.reduce((acc, s) => acc + s["Assignments (/10)"], 0) / total,
      subjects: subjectAvgs
    };
  }, [students]);

  const shapData = useMemo(() => {
    if (!selectedStudent) return [];
    
    const attDiff = selectedStudent["Attendance (%)"] - classAverages.attendance;
    const assDiff = (selectedStudent["Assignments (/10)"] - classAverages.assignments) * 10;
    
    const subjectImpacts = SUBJECT_COLS.map(s => ({
      name: s.replace(' (/100)', ''),
      value: (Number(selectedStudent[s as keyof Student]) || 0) - classAverages.subjects[s],
      score: Number(selectedStudent[s as keyof Student]) || 0
    }));

    return [
      { name: "Attendance (%)", value: attDiff, score: selectedStudent["Attendance (%)"] },
      ...subjectImpacts,
      { name: "Assignments (/10)", value: assDiff, score: selectedStudent["Assignments (/10)"] },
    ];
  }, [selectedStudent, classAverages]);

  const comparisonData = useMemo(() => {
    if (!selectedStudent) return [];
    return SUBJECT_COLS.map(s => ({
      name: s.replace(' (/100)', ''),
      Student: Number(selectedStudent[s as keyof Student]) || 0,
      Average: parseFloat(classAverages.subjects[s].toFixed(2))
    }));
  }, [selectedStudent, classAverages]);

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          Explainable <span className="text-scholar-primary">AI</span> Engine
        </h3>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Deep dive into individual student risk factors using SHAP-inspired feature impact analysis.
        </p>
      </div>
      
      <div className="scholar-card !p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Student to Analyze</label>
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
            <div className="flex items-center gap-4 p-4 bg-scholar-bg rounded-scholar border border-gray-100">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg",
                selectedStudent["Predicted Risk"] === "High Risk" ? "bg-scholar-primary shadow-scholar-primary/20" :
                selectedStudent["Predicted Risk"] === "Medium Risk" ? "bg-scholar-secondary shadow-scholar-secondary/20" :
                "bg-scholar-accent shadow-scholar-accent/20"
              )}>
                {selectedStudent["Predicted Risk"] === "High Risk" ? "⚠️" : 
                 selectedStudent["Predicted Risk"] === "Medium Risk" ? "⚡" : "✅"}
              </div>
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Prediction Status</p>
                <p className={cn(
                  "text-lg font-black",
                  selectedStudent["Predicted Risk"] === "High Risk" ? "text-scholar-primary" :
                  selectedStudent["Predicted Risk"] === "Medium Risk" ? "text-scholar-secondary" :
                  "text-scholar-accent"
                )}>
                  {selectedStudent["Predicted Risk"]}
                </p>
              </div>
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="space-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Simulated SHAP Waterfall Plot */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-scholar-primary rounded-full"></div>
                  <h5 className="text-xl font-black text-gray-900">Feature Impact Analysis</h5>
                </div>
                <div className="h-[350px] w-full bg-gray-50/50 rounded-scholar p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={shapData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis 
                        type="number" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#4b5563' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '20px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                        {shapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#7a6ad8" : "#f35525"} />
                        ))}
                      </Bar>
                      <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-scholar-accent rounded-full"></div>
                    <span className="text-xs font-bold text-gray-500">Positive (Lowers Risk)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-scholar-primary rounded-full"></div>
                    <span className="text-xs font-bold text-gray-500">Negative (Increases Risk)</span>
                  </div>
                </div>
              </div>

              {/* Comparison Chart */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-scholar-secondary rounded-full"></div>
                  <h5 className="text-xl font-black text-gray-900">Student vs Class Average</h5>
                </div>
                <div className="h-[350px] w-full bg-gray-50/50 rounded-scholar p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#4b5563' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ 
                          borderRadius: '20px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Legend 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-black text-gray-500 uppercase tracking-widest ml-2">{value}</span>}
                      />
                      <Bar dataKey="Student" fill="#ee626b" radius={[10, 10, 0, 0]} barSize={30} />
                      <Bar dataKey="Average" fill="#94a3b8" radius={[10, 10, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-scholar-accent rounded-full"></div>
                <h5 className="text-xl font-black text-gray-900">Subject-by-Subject Breakdown</h5>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {SUBJECT_COLS.map((subject, idx) => {
                  const score = Number(selectedStudent[subject as keyof Student]) || 0;
                  const label = subject.replace(' (/100)', '');
                  return (
                    <div key={idx} className={cn(
                      "p-6 rounded-scholar border-2 transition-all duration-300 hover:-translate-y-1",
                      score < 40 ? "bg-red-50 border-red-100 text-red-700" :
                      score < 60 ? "bg-orange-50 border-orange-100 text-orange-700" :
                      "bg-emerald-50 border-emerald-100 text-emerald-700"
                    )}>
                      <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-70">{label}</p>
                      <p className="text-3xl font-black">{score}<span className="text-sm opacity-50 ml-1">/100</span></p>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-8 bg-scholar-primary/5 border-2 border-scholar-primary/20 rounded-scholar flex items-start gap-6">
                <div className="w-14 h-14 bg-scholar-primary rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-scholar-primary/20 shrink-0">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h6 className="text-lg font-black text-gray-900">Primary Weak Area Identified</h6>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    Based on our AI analysis, <span className="text-scholar-primary font-black">{selectedStudent.Name}</span> is struggling most in <span className="font-black text-gray-900 underline decoration-scholar-primary decoration-2 underline-offset-4">{selectedStudent["Weakest Subject"]?.replace(' (/100)', '')}</span> with a score of <span className="font-black text-gray-900">{selectedStudent["Weakest Score"]}/100</span>. This subject is the primary driver for the current risk prediction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

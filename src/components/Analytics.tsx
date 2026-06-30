import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Student } from "../types";

interface AnalyticsProps {
  students: Student[];
}

export default function Analytics({ students }: AnalyticsProps) {
  const riskData = useMemo(() => {
    const counts = {
      "High Risk": 0,
      "Medium Risk": 0,
      "Low Risk": 0
    };
    students.forEach(s => {
      if (s["Predicted Risk"]) counts[s["Predicted Risk"]]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const performanceData = useMemo(() => {
    const categories = ["High Risk", "Medium Risk", "Low Risk"];
    return categories.map(cat => {
      const catStudents = students.filter(s => s["Predicted Risk"] === cat);
      const avgAttendance = catStudents.length > 0 
        ? catStudents.reduce((acc, s) => acc + s["Attendance (%)"], 0) / catStudents.length 
        : 0;
      const avgMarks = catStudents.length > 0 
        ? catStudents.reduce((acc, s) => acc + (s["Avg Marks"] || 0), 0) / catStudents.length 
        : 0;
      return {
        name: cat,
        "Attendance (%)": parseFloat(avgAttendance.toFixed(2)),
        "Avg Marks": parseFloat(avgMarks.toFixed(2))
      };
    });
  }, [students]);

  const subjectAvgData = useMemo(() => {
    const SUBJECT_COLS = ['Maths (/100)', 'Physics (/100)', 'Chemistry (/100)', 'Computer Science (/100)', 'English (/100)'];
    const categories = ["High Risk", "Medium Risk", "Low Risk"];
    
    return SUBJECT_COLS.map(subject => {
      const data: any = { subject: subject.replace(' (/100)', '') };
      categories.forEach(cat => {
        const catStudents = students.filter(s => s["Predicted Risk"] === cat);
        const avg = catStudents.length > 0
          ? catStudents.reduce((acc, s) => acc + (Number(s[subject as keyof Student]) || 0), 0) / catStudents.length
          : 0;
        data[cat] = parseFloat(avg.toFixed(2));
      });
      return data;
    });
  }, [students]);

  const weakSubjectData = useMemo(() => {
    const atRiskStudents = students.filter(s => s["Predicted Risk"] === "High Risk" || s["Predicted Risk"] === "Medium Risk");
    const counts: Record<string, number> = {};
    atRiskStudents.forEach(s => {
      if (s["Weakest Subject"]) {
        const cleanName = s["Weakest Subject"].replace(' (/100)', '');
        counts[cleanName] = (counts[cleanName] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [students]);

  const COLORS = {
    "High Risk": "#f35525", // Scholar Primary
    "Medium Risk": "#ee626b", // Scholar Secondary
    "Low Risk": "#7a6ad8" // Scholar Accent
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">
          Advanced <span className="text-scholar-primary">AI</span> Insights
        </h3>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Visualizing student distributions and performance trends to help faculty make data-driven decisions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Donut Chart */}
        <div className="scholar-card group">
          <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-scholar-primary rounded-full"></div>
            Overall Risk Distribution
          </h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {riskData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS]} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontWeight: 'bold'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-black text-gray-500 uppercase tracking-widest ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped Bar Chart */}
        <div className="scholar-card group">
          <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-scholar-secondary rounded-full"></div>
            Performance by Category
          </h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
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
                <Bar dataKey="Attendance (%)" fill="#7a6ad8" radius={[10, 10, 0, 0]} barSize={30} />
                <Bar dataKey="Avg Marks" fill="#ee626b" radius={[10, 10, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Subject-Wise Average Marks */}
        <div className="scholar-card group">
          <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-scholar-accent rounded-full"></div>
            Subject-Wise Averages
          </h4>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectAvgData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="subject" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
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
                <Bar dataKey="High Risk" fill={COLORS["High Risk"]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Medium Risk" fill={COLORS["Medium Risk"]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Low Risk" fill={COLORS["Low Risk"]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Common Weak Subjects */}
        <div className="scholar-card group">
          <h4 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            Common Weak Subjects
          </h4>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weakSubjectData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontWeight: 'bold'
                  }} 
                />
                <Bar dataKey="count" fill="#f35525" radius={[10, 10, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

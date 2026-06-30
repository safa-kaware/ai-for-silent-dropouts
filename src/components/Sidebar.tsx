import { useState, useRef, ChangeEvent } from "react";
import { LogOut, Key, Settings, Upload, ChevronDown, ChevronUp, Bot, Smartphone, Download } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Student } from "../types";
import { motion } from "motion/react";

interface SidebarProps {
  onFileUpload: (data: Student[]) => void;
  geminiKey: string;
  setGeminiKey: (val: string) => void;
  twSid: string;
  setTwSid: (val: string) => void;
  twToken: string;
  setTwToken: (val: string) => void;
  twPhone: string;
  setTwPhone: (val: string) => void;
}

export default function Sidebar({
  onFileUpload,
  geminiKey,
  setGeminiKey,
  twSid,
  setTwSid,
  twToken,
  setTwToken,
  twPhone,
  setTwPhone
}: SidebarProps) {
  const [geminiOpen, setGeminiOpen] = useState(false);
  const [twilioOpen, setTwilioOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    setUploadStatus(null);

    if (file.name.endsWith(".csv")) {
      reader.onload = (event) => {
        try {
          const csvData = event.target?.result as string;
          Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              onFileUpload(results.data as Student[]);
              setUploadStatus({ type: 'success', msg: 'CSV uploaded successfully!' });
              setTimeout(() => setUploadStatus(null), 3000);
            }
          });
        } catch (e) {
          console.error("Error parsing CSV:", e);
          setUploadStatus({ type: 'error', msg: 'Failed to parse CSV.' });
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          onFileUpload(jsonData as Student[]);
          setUploadStatus({ type: 'success', msg: 'Excel uploaded successfully!' });
          setTimeout(() => setUploadStatus(null), 3000);
        } catch (e) {
          console.error("Error parsing Excel file:", e);
          setUploadStatus({ type: 'error', msg: 'Failed to parse Excel file.' });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus({ type: 'error', msg: 'Unsupported file format.' });
    }
  };

  const downloadSampleData = () => {
    const students = [];
    const subjects = ["Maths (/100)", "Physics (/100)", "Chemistry (/100)", "Computer Science (/100)", "English (/100)"];
    const names = [
      "Aarav", "Aditi", "Arjun", "Ananya", "Ishaan", "Kavya", "Rohan", "Saanvi", "Vivaan", "Diya",
      "Reyansh", "Myra", "Kabir", "Anika", "Aryan", "Kiara", "Dev", "Zoya", "Atharv", "Shanaya",
      "Krishna", "Navya", "Shaurya", "Avni", "Rishi", "Ira", "Arnav", "Sia", "Veer", "Prisha",
      "Dhruv", "Anvi", "Ranveer", "Tara", "Yuvraj", "Sara", "Ayaan", "Inaya", "Eshan", "Riya",
      "Advait", "Amara", "Hrithik", "Kriti", "Varun", "Alia", "Ranbir", "Deepika", "Anushka", "Virat",
      "Rohit", "Hardik", "Jasprit", "Rishabh", "KL Rahul", "Shreyas", "Ravindra", "MS Dhoni", "Sachin", "Sourav",
      "Rahul", "VVS Laxman", "Virender", "Yuvraj", "Zaheer", "Anil", "Harbhajan", "Javagal", "Ajit", "Irfan",
      "Gautam", "Suresh", "Dinesh", "Shikhar", "Ravichandran", "Bhuvneshwar", "Mohammed", "Kuldeep", "Yuzvendra", "Axar"
    ];
    const surnames = ["Sharma", "Rao", "Patel", "Iyer", "Gupta", "Nair", "Deshmukh", "Kulkarni", "Joshi", "Malhotra", "Singh", "Kapoor", "Reddy", "Verma", "Saxena", "Bhatia", "Choudhury", "Khan", "Mishra", "Pillai"];

    for (let i = 0; i < 10; i++) {
      const firstName = names[i % names.length];
      const lastName = surnames[i % surnames.length];
      const fullName = `${firstName} ${lastName}`;
      const rollNo = 200 + i;
      
      // Create a mix of risk levels
      let attendance, marks;
      if (i % 5 === 0) { // High Risk
        attendance = Math.floor(Math.random() * 30) + 10;
        marks = subjects.reduce((acc, sub) => ({ ...acc, [sub]: Math.floor(Math.random() * 30) + 10 }), {});
      } else if (i % 3 === 0) { // Medium Risk
        attendance = Math.floor(Math.random() * 30) + 40;
        marks = subjects.reduce((acc, sub) => ({ ...acc, [sub]: Math.floor(Math.random() * 30) + 40 }), {});
      } else { // Low Risk
        attendance = Math.floor(Math.random() * 25) + 75;
        marks = subjects.reduce((acc, sub) => ({ ...acc, [sub]: Math.floor(Math.random() * 25) + 75 }), {});
      }

      students.push({
        "Name": fullName,
        "Roll No": rollNo,
        "Email": `${firstName.toLowerCase()}_${rollNo}@college.edu`,
        "Student Phone": `98765432${i.toString().padStart(2, '0')}`,
        "Parent Phone": `91234567${i.toString().padStart(2, '0')}`,
        "Attendance (%)": attendance,
        ...marks,
        "Assignments (/10)": Math.floor(Math.random() * 10) + 1
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "AI_for_Silent_Dropouts_Sample_Template.xlsx");
  };

  return (
    <aside className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-100/50 flex flex-col h-full shadow-2xl z-20">
      {/* Section 1: User Greeting */}
      <div className="p-8 border-b border-gray-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-scholar-primary rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-scholar-primary/20">
            👨‍🏫
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Faculty Access</p>
            <p className="text-sm font-bold text-gray-900">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Section 2: API Integrations */}
        <div className="p-8 space-y-6">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Key className="w-3 h-3 text-scholar-primary" /> API Integrations
          </h3>

          {/* Gemini AI Config */}
          <div className="bg-scholar-bg/50 rounded-scholar p-1">
            <button
              onClick={() => setGeminiOpen(!geminiOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-white rounded-scholar transition-all duration-300"
            >
              <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
                <Bot className="w-4 h-4 text-scholar-primary" /> AI Config
              </span>
              {geminiOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {geminiOpen && (
              <div className="p-4 space-y-4 bg-white rounded-scholar mt-1 shadow-inner">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-scholar-bg border-none rounded-full focus:ring-2 focus:ring-scholar-primary outline-none"
                    placeholder="Enter Key"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Twilio SMS Config */}
          <div className="bg-scholar-bg/50 rounded-scholar p-1">
            <button
              onClick={() => setTwilioOpen(!twilioOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-white rounded-scholar transition-all duration-300"
            >
              <span className="text-sm font-bold flex items-center gap-2 text-gray-700">
                <Smartphone className="w-4 h-4 text-scholar-secondary" /> SMS Config
              </span>
              {twilioOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {twilioOpen && (
              <div className="p-4 space-y-4 bg-white rounded-scholar mt-1 shadow-inner">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Account SID</label>
                  <input
                    type="password"
                    value={twSid}
                    onChange={(e) => setTwSid(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-scholar-bg border-none rounded-full focus:ring-2 focus:ring-scholar-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Auth Token</label>
                  <input
                    type="password"
                    value={twToken}
                    onChange={(e) => setTwToken(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-scholar-bg border-none rounded-full focus:ring-2 focus:ring-scholar-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Twilio Phone</label>
                  <input
                    type="text"
                    value={twPhone}
                    onChange={(e) => setTwPhone(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-scholar-bg border-none rounded-full focus:ring-2 focus:ring-scholar-primary outline-none"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Control Panel */}
        <div className="p-8 space-y-6">
          <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Settings className="w-3 h-3 text-scholar-primary" /> Control Panel
          </h3>
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 ml-2">Upload Student Data</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-scholar-primary/20 rounded-scholar p-6 text-center hover:border-scholar-primary hover:bg-scholar-bg transition-all cursor-pointer group bg-scholar-bg/20"
            >
              <Upload className="w-8 h-8 text-scholar-primary/40 mx-auto mb-2 group-hover:text-scholar-primary transition-colors" />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Upload CSV / XLSX</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden" 
              />
            </div>

            <button
              onClick={downloadSampleData}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-scholar-primary/10 rounded-scholar text-[10px] font-black text-scholar-primary uppercase tracking-widest hover:bg-scholar-primary hover:text-white transition-all duration-300 shadow-sm"
            >
              <Download className="w-3 h-3" /> Download Sample Template
            </button>
            <p className="text-[9px] text-gray-400 font-medium text-center px-2">
              Use the template above to ensure your data matches the required format for AI analysis.
            </p>
          </div>

          {uploadStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-center ${
                uploadStatus.type === 'success' ? "bg-emerald-50 text-emerald-600 shadow-sm" : "bg-red-50 text-red-600 shadow-sm"
              }`}
            >
              {uploadStatus.msg}
            </motion.div>
          )}
        </div>
      </div>
    </aside>
  );
}

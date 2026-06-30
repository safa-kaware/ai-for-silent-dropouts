import { useState, ChangeEvent, FormEvent, useMemo } from "react";
import { Upload, Search, Filter, FileText, Link as LinkIcon, Download, ExternalLink, Sparkles, Loader2, AlertTriangle, Settings, Bot } from "lucide-react";
import { StudyMaterial, RiskLevel, Student } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface StudyMaterialProps {
  materials: StudyMaterial[];
  students: Student[];
  onUpload: (material: StudyMaterial) => void;
  onClearMaterials?: () => void;
  onResourceAccess?: (resourceTitle: string, resourceLink: string) => void;
}

export default function StudyMaterialTab({ materials, students, onUpload, onClearMaterials, onResourceAccess }: StudyMaterialProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Engineering Mathematics");
  const [intendedFor, setIntendedFor] = useState<RiskLevel[]>(["High Risk", "Medium Risk"]);
  const [type, setType] = useState<"Upload File (PDF/Docs)" | "External Link">("Upload File (PDF/Docs)");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [filterSubject, setFilterSubject] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [highlightStudentName, setHighlightStudentName] = useState("None (show all)");
  const [freeLinkFilter, setFreeLinkFilter] = useState("All Subjects");

  const dynamicSubjects = useMemo(() => {
    const allSubjects = new Set<string>();
    students.forEach(s => {
      Object.keys(s).forEach(key => {
        if (key.includes("(/100)")) {
          allSubjects.add(key.replace(" (/100)", "").trim());
        }
      });
    });
    return Array.from(allSubjects);
  }, [students]);

  const subjects = dynamicSubjects.length > 0 ? dynamicSubjects : [
    "Engineering Mathematics",
    "Engineering Physics",
    "Engineering Chemistry",
    "Engineering Mechanics",
    "Basic Electrical Engineering (BEE)",
    "Structured Programming Approach (SPA)",
    "Data Structures & Analysis",
    "Computer Networks",
    "Operating Systems",
    "Database Management Systems",
    "Other Engineering Subjects"
  ];

  const handleResourceClick = (title: string, link: string) => {
    if (onResourceAccess) {
      onResourceAccess(title, link);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    if (!title) {
      setUploadStatus({ type: 'error', msg: 'Please provide a title for the material.' });
      return;
    }

    if (type === "Upload File (PDF/Docs)" && !file) {
      setUploadStatus({ type: 'error', msg: 'Please select a file to upload.' });
      return;
    }

    if (type === "External Link" && !link) {
      setUploadStatus({ type: 'error', msg: 'Please provide a valid link.' });
      return;
    }

    setIsUploading(true);

    const saveMaterial = (fileData: string | Uint8Array | null = null) => {
      try {
        const newMaterial: StudyMaterial = {
          title,
          subject,
          for_risk: intendedFor,
          type,
          file_name: file?.name,
          file_data: fileData,
          link,
          description,
          uploaded_on: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
        };
        onUpload(newMaterial);
        
        // Reset form
        setTitle("");
        setFile(null);
        setLink("");
        setDescription("");
        setUploadStatus({ type: 'success', msg: 'Material uploaded successfully!' });
        
        // Clear success message after 3 seconds
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (err) {
        setUploadStatus({ type: 'error', msg: 'Failed to upload. The file might be too large for local storage.' });
      } finally {
        setIsUploading(false);
      }
    };

    if (type === "Upload File (PDF/Docs)" && file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setUploadStatus({ type: 'error', msg: 'File is too large (max 1.5MB for browser storage). Please use an External Link instead.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        saveMaterial(event.target?.result as string);
      };
      reader.onerror = () => {
        setUploadStatus({ type: 'error', msg: 'Error reading file.' });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      saveMaterial();
    }
  };

  const handleDownload = (material: StudyMaterial) => {
    if (material.file_data && typeof material.file_data === "string") {
      const link = document.createElement("a");
      link.href = material.file_data;
      link.download = material.file_name || "download";
      link.click();
    }
  };

  const filteredMaterials = materials.filter(m => {
    const subjectMatch = filterSubject === "All" || m.subject === filterSubject;
    const riskMatch = filterRisk === "All" || m.for_risk.includes(filterRisk as RiskLevel);
    return subjectMatch && riskMatch;
  });

  const getSmartLinks = (subject: string) => {
    return [
      {
        name: `NPTEL: ${subject}`,
        link: `https://nptel.ac.in/courses?search=${encodeURIComponent(subject)}`
      },
      {
        name: `Coursera: ${subject}`,
        link: `https://www.coursera.org/search?query=${encodeURIComponent(subject)}`
      }
    ];
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Section A: Teacher Upload Panel */}
      <div className="scholar-card space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-scholar-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-scholar-primary/20">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              Upload <span className="text-scholar-primary">Syllabus</span> Material
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Faculty Control Panel</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-4">Material Title</label>
              <input
                type="text"
                placeholder="e.g., 'MU Maths-1 Unit 2 Notes'"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="scholar-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-4">Subject (MU Syllabus)</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="scholar-input"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-4">Intended For (Risk Level)</label>
            <div className="flex flex-wrap gap-6 px-4">
              {["High Risk", "Medium Risk", "Low Risk"].map(risk => (
                <label key={risk} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={intendedFor.includes(risk as RiskLevel)}
                      onChange={(e) => {
                        if (e.target.checked) setIntendedFor([...intendedFor, risk as RiskLevel]);
                        else setIntendedFor(intendedFor.filter(r => r !== risk));
                      }}
                      className="w-5 h-5 border-2 border-gray-300 rounded-lg checked:bg-scholar-primary checked:border-scholar-primary transition-all cursor-pointer appearance-none"
                    />
                    {intendedFor.includes(risk as RiskLevel) && (
                      <Sparkles className="w-3 h-3 text-white absolute left-1 pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-scholar-primary transition-colors">{risk}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 ml-4">Material Type</label>
            <div className="flex gap-8 px-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={type === "Upload File (PDF/Docs)"}
                  onChange={() => setType("Upload File (PDF/Docs)")}
                  className="w-5 h-5 border-2 border-gray-300 rounded-full checked:border-scholar-primary checked:border-[6px] transition-all cursor-pointer appearance-none"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-scholar-primary transition-colors">Upload File (PDF/Docs)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={type === "External Link"}
                  onChange={() => setType("External Link")}
                  className="w-5 h-5 border-2 border-gray-300 rounded-full checked:border-scholar-primary checked:border-[6px] transition-all cursor-pointer appearance-none"
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-scholar-primary transition-colors">External Link</span>
              </label>
            </div>
          </div>

          {type === "Upload File (PDF/Docs)" ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-4">Upload File</label>
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="scholar-input !py-10 border-dashed border-2 hover:border-scholar-primary transition-colors cursor-pointer"
                  accept=".pdf,.docx,.pptx,.txt"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-gray-400 group-hover:text-scholar-primary transition-colors">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">{file ? file.name : "Click or drag to upload (Max 1.5MB)"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-4">Paste Link</label>
              <input
                type="url"
                placeholder="NPTEL, Coursera, SWAYAM, etc."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="scholar-input"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-4">Short Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="scholar-input resize-none"
              placeholder="Provide context for the students..."
            />
          </div>

          {uploadStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-scholar text-sm font-bold flex items-center gap-3",
                uploadStatus.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
              )}
            >
              {uploadStatus.type === 'success' ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {uploadStatus.msg}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className={cn(
              "scholar-btn-primary w-full !py-4 flex items-center justify-center gap-3 text-lg",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Uploading...
              </>
            ) : (
              <>📌 Publish Material</>
            )}
          </button>
        </form>
      </div>

      {/* Section B: Browse & Access Materials */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-scholar-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-scholar-secondary/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Browse <span className="text-scholar-secondary">Study</span> Materials
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Resources</p>
            </div>
          </div>
          {materials.length > 0 && onClearMaterials && (
            <button 
              onClick={onClearMaterials}
              className="scholar-btn-secondary !bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-600 hover:!text-white flex items-center gap-2 !px-6"
            >
              <Download className="w-4 h-4 rotate-180" /> Clear All
            </button>
          )}
        </div>

        <div className="scholar-card !bg-scholar-bg/30 border-none space-y-8">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Search & Filter</h4>
            {(filterSubject !== "All" || filterRisk !== "All") && (
              <button 
                onClick={() => { setFilterSubject("All"); setFilterRisk("All"); }}
                className="text-xs text-scholar-primary font-black uppercase tracking-widest hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-4 uppercase">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="scholar-input !bg-white"
              >
                <option value="All">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 ml-4 uppercase">Risk Level</label>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="scholar-input !bg-white"
              >
                <option value="All">All Risk Levels</option>
                <option value="High Risk">High Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="Low Risk">Low Risk</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-200/50" />

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-scholar-primary" /> Personalized Student View
              </label>
              {highlightStudentName !== "None (show all)" && (
                <button 
                  onClick={() => setHighlightStudentName("None (show all)")}
                  className="text-xs text-scholar-primary font-black uppercase tracking-widest hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <select
              value={highlightStudentName}
              onChange={(e) => setHighlightStudentName(e.target.value)}
              className="scholar-input !bg-white"
            >
              <option value="None (show all)">None (show all)</option>
              {students.map((s, idx) => (
                <option key={idx} value={s.Name}>{s.Name} ({s["Predicted Risk"]})</option>
              ))}
            </select>
          </div>

          {highlightStudentName !== "None (show all)" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-scholar-primary text-white rounded-scholar shadow-xl shadow-scholar-primary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              {(() => {
                const s = students.find(st => st.Name === highlightStudentName);
                if (!s) return null;
                const weakSub = s["Weakest Subject"]?.replace(' (/100)', '') || "";
                const count = filteredMaterials.filter(m => m.subject.toLowerCase().includes(weakSub.toLowerCase())).length;
                
                return (
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Recommendation for {s.Name}</p>
                      <p className="text-lg font-black tracking-tight">
                        Focusing on <span className="underline decoration-white/30 underline-offset-4">{weakSub}</span>
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                          {count} Resources Found
                        </span>
                        <p className="text-[10px] font-bold opacity-80 italic">Targeting score: {s["Weakest Score"]}/100</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="scholar-card !bg-scholar-bg/20 border-none p-16 text-center space-y-4">
            <div className="text-5xl opacity-20">📂</div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No materials found</p>
            <p className="text-xs font-medium text-gray-400 max-w-xs mx-auto italic">Try adjusting your filters or upload new content to the library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMaterials.map((material, idx) => {
              const hStudent = students.find(st => st.Name === highlightStudentName);
              const weakSub = hStudent?.["Weakest Subject"]?.replace(' (/100)', '') || "";
              const isHighlighted = hStudent && weakSub && material.subject.toLowerCase().includes(weakSub.toLowerCase());

              return (
                <div key={idx} className={cn(
                  "scholar-card group transition-all duration-500",
                  isHighlighted ? "ring-4 ring-scholar-primary/20 !bg-scholar-primary !text-white" : "hover:bg-scholar-secondary hover:text-white"
                )}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors",
                          isHighlighted ? "text-white/80" : "text-scholar-primary group-hover:text-white/80"
                        )}>
                          {material.subject}
                        </p>
                        {isHighlighted && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-black tracking-tight">📄 {material.title}</h4>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                      isHighlighted ? "bg-white/20" : "bg-scholar-bg group-hover:bg-white/20"
                    )}>
                      {material.type === "External Link" ? <LinkIcon className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {material.for_risk.map(risk => (
                        <span key={risk} className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md",
                          isHighlighted ? "bg-white/10" : "bg-scholar-bg group-hover:bg-white/10"
                        )}>
                          {risk}
                        </span>
                      ))}
                    </div>
                    
                    {material.description && (
                      <p className="text-xs font-medium opacity-80 italic leading-relaxed">
                        "{material.description}"
                      </p>
                    )}
                    
                    <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">
                      Uploaded {material.uploaded_on}
                    </p>
                  </div>

                  <div className="mt-8">
                    {material.type === "External Link" ? (
                      <a
                        href={material.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResourceClick(`Material: ${material.title}`, material.link || "")}
                        className={cn(
                          "w-full py-4 rounded-full text-xs font-black uppercase tracking-widest text-center block transition-all shadow-xl",
                          isHighlighted ? "bg-white text-scholar-primary hover:scale-[1.02]" : "bg-scholar-bg group-hover:bg-white group-hover:text-scholar-secondary hover:scale-[1.02]"
                        )}
                      >
                        Open Resource
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          handleDownload(material);
                          handleResourceClick(`Download: ${material.title}`, material.file_name || "File");
                        }}
                        className={cn(
                          "w-full py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl",
                          isHighlighted ? "bg-white text-scholar-primary hover:scale-[1.02]" : "bg-scholar-bg group-hover:bg-white group-hover:text-scholar-secondary hover:scale-[1.02]"
                        )}
                      >
                        Download File
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature 3: Built-in Free Course Links Library */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-black text-gray-900 tracking-tight">
            Global <span className="text-scholar-accent">Learning</span> Library
          </h3>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Curated open-source resources from top universities and platforms, available to all students.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="scholar-card !p-2 !rounded-full !bg-scholar-bg/50 flex flex-wrap justify-center gap-2">
            {[
              "All Subjects",
              "Engineering Mathematics",
              "Physics & Chemistry",
              "Mechanics & BEE",
              "Programming & DS",
              "Core CS Subjects",
              "MU Portals"
            ].map(cat => (
              <button
                key={cat}
                onClick={() => setFreeLinkFilter(cat)}
                className={cn(
                  "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  freeLinkFilter === cat ? "bg-scholar-accent text-white shadow-lg" : "text-gray-500 hover:bg-white"
                )}
              >
                {cat.replace('Engineering ', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {subjects.map((sub) => {
            const links = getSmartLinks(sub);
            return (
              <div key={sub} className="scholar-card !p-8 space-y-6 group hover:border-scholar-primary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-scholar-bg rounded-xl flex items-center justify-center text-scholar-primary group-hover:bg-scholar-primary group-hover:text-white transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{sub}</p>
                </div>
                <div className="space-y-3">
                  {links.map((link, lIdx) => (
                    <a 
                      key={lIdx}
                      href={link.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={() => handleResourceClick(link.name, link.link)}
                      className="flex items-center justify-between p-4 bg-scholar-bg/50 hover:bg-scholar-primary hover:text-white rounded-2xl text-xs font-bold transition-all group/link"
                    >
                      {link.name}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* MU Official & Portals */}
          <div className="scholar-card !p-8 space-y-6 group hover:border-scholar-primary/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-scholar-bg rounded-xl flex items-center justify-center text-scholar-primary group-hover:bg-scholar-primary group-hover:text-white transition-all">
                <LinkIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">MU Portals</p>
            </div>
            <div className="space-y-3">
              <a 
                href="https://mu.ac.in/syllabus" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => handleResourceClick("MU Official Syllabus", "https://mu.ac.in/syllabus")}
                className="flex items-center justify-between p-4 bg-scholar-bg/50 hover:bg-scholar-primary hover:text-white rounded-2xl text-xs font-bold transition-all group/link"
              >
                MU Official Syllabus
                <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </a>
              <a 
                href="https://swayam.gov.in/" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => handleResourceClick("SWAYAM Portal", "https://swayam.gov.in/")}
                className="flex items-center justify-between p-4 bg-scholar-bg/50 hover:bg-scholar-primary hover:text-white rounded-2xl text-xs font-bold transition-all group/link"
              >
                SWAYAM Portal
                <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from "motion/react";
import { Brain, Shield, TrendingUp, Users, ArrowRight, Sparkles, BookOpen, Heart } from "lucide-react";
import { cn } from "../lib/utils";

interface LandingPageProps {
  onLoginClick: (type: "faculty" | "student") => void;
}

export default function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-scholar-primary selection:text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-scholar-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-scholar-secondary/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] bg-scholar-accent/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-scholar-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-scholar-primary/20">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900">AI for <span className="text-scholar-primary">Silent Dropouts</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-bold text-gray-500 hover:text-scholar-primary transition-colors">About</a>
            <a href="#features" className="text-sm font-bold text-gray-500 hover:text-scholar-primary transition-colors">Features</a>
            <button 
              onClick={() => onLoginClick("faculty")}
              className="scholar-btn-primary !py-2.5 !px-6 !text-xs"
            >
              Faculty Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-scholar-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-0 w-96 h-96 bg-scholar-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-scholar-bg rounded-full text-scholar-primary text-[10px] font-black uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-3 h-3" />
            Empowering the Next Generation
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1]"
          >
            Saving Every <span className="text-scholar-primary">Child's Future</span> <br />
            Through Predictive Intelligence.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-500 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            We don't just track grades; we identify potential risks before they become failures. 
            Our AI-powered platform provides personalized recovery paths for every student, 
            ensuring no one is left behind.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => onLoginClick("student")}
              className="scholar-btn-primary !py-5 !px-10 !text-base flex items-center gap-3 group"
            >
              Student Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onLoginClick("faculty")}
              className="scholar-btn-secondary !py-5 !px-10 !text-base"
            >
              Faculty Access
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-32 bg-transparent relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-block p-3 bg-white rounded-2xl shadow-xl shadow-scholar-primary/10">
                <Heart className="w-8 h-8 text-scholar-primary" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Our Mission: <br />
                <span className="text-scholar-primary">Zero Dropout</span> Education.
              </h2>
              <p className="text-lg text-gray-600 font-medium leading-relaxed">
                AI for Silent Dropouts was born from a simple realization: many students fail not because of a lack of ability, 
                but because of a lack of timely intervention. By the time a student fails an exam, it's often too late.
              </p>
              <p className="text-lg text-gray-600 font-medium leading-relaxed">
                Our platform uses advanced predictive analytics to monitor attendance, engagement, and performance 
                in real-time. We flag "at-risk" students weeks before exams, allowing educators to step in 
                with personalized recovery plans and resources.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-4xl font-black text-scholar-primary mb-1">95%</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accuracy in Risk Detection</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-scholar-secondary mb-1">40%</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reduction in Dropouts</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-white rounded-[40px] shadow-2xl p-8 relative z-10">
                <div className="w-full h-full bg-scholar-bg rounded-[32px] flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://picsum.photos/seed/education/800/800" 
                    alt="Education" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-scholar-accent/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-scholar-primary/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              How We <span className="text-scholar-primary">Protect</span> Their Future
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              A comprehensive suite of tools designed to identify, analyze, and support students at every stage of their academic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Predictive Analytics",
                desc: "AI models that predict student risk levels based on attendance, marks, and behavioral patterns.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Early Warning System",
                desc: "Automated alerts for faculty when a student's performance dips below critical thresholds.",
                color: "bg-red-50 text-red-600"
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: "Personalized Recovery",
                desc: "Dynamic study plans and resource recommendations tailored to each student's weakest subjects.",
                color: "bg-emerald-50 text-emerald-600"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Faculty Dashboard",
                desc: "Comprehensive overview of class performance with deep-dive analytics for every student.",
                color: "bg-purple-50 text-purple-600"
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Explainable AI",
                desc: "Understand exactly why a student is flagged as high risk with transparent AI reasoning.",
                color: "bg-orange-50 text-orange-600"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Parent Connectivity",
                desc: "Integrated SMS and email alerts to keep parents informed and involved in the recovery process.",
                color: "bg-scholar-bg text-scholar-primary"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="scholar-card group hover:-translate-y-2 transition-all duration-500"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", feature.color)}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-4 tracking-tight">{feature.title}</h4>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-scholar-primary rounded-xl flex items-center justify-center text-white">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-xl font-black tracking-tighter">AI for <span className="text-scholar-primary">Silent Dropouts</span></span>
              </div>
              <p className="text-gray-400 font-medium max-w-sm">
                Dedicated to transforming education through data-driven insights and compassionate intervention.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-6">Platform</h5>
              <ul className="space-y-4 text-gray-400 font-medium text-sm">
                <li><button onClick={() => onLoginClick("faculty")} className="hover:text-scholar-primary transition-colors">Faculty Dashboard</button></li>
                <li><button onClick={() => onLoginClick("student")} className="hover:text-scholar-primary transition-colors">Student Portal</button></li>
                <li><a href="#" className="hover:text-scholar-primary transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-black uppercase tracking-widest mb-6">Contact</h5>
              <ul className="space-y-4 text-gray-400 font-medium text-sm">
                <li>support@scholarai.edu</li>
                <li>+1 (555) 000-1234</li>
                <li>Mumbai, India</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">© 2026 AI for Silent Dropouts. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

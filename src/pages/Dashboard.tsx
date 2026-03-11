import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Shield, BookOpen, Calculator, Brain, Shapes, Languages, FileText, Users,
  Play, Lock, ArrowRight, LogOut, BarChart3, Clock
} from "lucide-react";

const modules = [
  { id: 1, icon: BookOpen, title: "Understanding the RCMP Aptitude Test", lessons: 4, duration: "45 min", unlocked: true },
  { id: 2, icon: Calculator, title: "Numerical Skills", lessons: 8, duration: "2 hrs", unlocked: true },
  { id: 3, icon: Brain, title: "Memory & Observation", lessons: 6, duration: "1.5 hrs", unlocked: true },
  { id: 4, icon: Shapes, title: "Spatial Reasoning", lessons: 7, duration: "1.5 hrs", unlocked: true },
  { id: 5, icon: Languages, title: "Language & Logical Reasoning", lessons: 6, duration: "1.5 hrs", unlocked: true },
  { id: 6, icon: FileText, title: "Full Practice Tests", lessons: 5, duration: "3 hrs", unlocked: true },
  { id: 7, icon: Users, title: "Work Style & Professional Judgment", lessons: 5, duration: "1 hr", unlocked: true },
];

const practiceTests = [
  { title: "Numerical Reasoning", questions: 25, time: "30 min" },
  { title: "Memory & Observation", questions: 20, time: "25 min" },
  { title: "Language Reasoning", questions: 25, time: "30 min" },
  { title: "Spatial Reasoning", questions: 20, time: "25 min" },
  { title: "Full RCMP Simulation", questions: 100, time: "120 min" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy border-b border-navy-light/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" />
            <span className="font-heading text-lg font-bold text-primary-foreground">AptitudeForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-foreground/50 hidden sm:block">Welcome back</span>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/50 hover:text-primary-foreground hover:bg-navy-light">
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: "Modules Completed", value: "0/7", icon: BookOpen },
            { label: "Practice Tests Taken", value: "0", icon: BarChart3 },
            { label: "Study Time", value: "0 hrs", icon: Clock },
            { label: "Days Remaining", value: "180", icon: Shield },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Training Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Training Modules</h2>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => navigate(`/module/${mod.id}`)}
                  className="w-full glass-card rounded-xl p-5 flex items-center gap-4 hover:border-accent/30 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                    <mod.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">Module {mod.id}</p>
                    <p className="font-semibold text-foreground truncate">{mod.title}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{mod.lessons} lessons</span>
                    <span>{mod.duration}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Practice Tests */}
        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Practice Tests</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceTests.map((test, i) => (
              <motion.div
                key={test.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass-card rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{test.title}</h3>
                  <Play className="h-5 w-5 text-accent flex-shrink-0" />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{test.questions} questions</span>
                  <span>{test.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

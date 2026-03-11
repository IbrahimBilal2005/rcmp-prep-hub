import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BarChart3, Clock, Shield, ArrowRight, Play, Timer, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { modules, practiceTests } from "@/data/courseData";

type Tab = "modules" | "tests";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("modules");
  const navigate = useNavigate();

  const stats = [
    { label: "Modules Completed", value: "0/7", icon: BookOpen },
    { label: "Tests Taken", value: "0", icon: BarChart3 },
    { label: "Study Time", value: "0 hrs", icon: Clock },
    { label: "Days Remaining", value: "180", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
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

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8 max-w-md">
          {[
            { key: "modules" as Tab, label: "Training Modules", icon: BookOpen },
            { key: "tests" as Tab, label: "Practice Tests", icon: Timer },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "modules" ? (
            <motion.div
              key="modules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {modules.map((mod, i) => (
                  <motion.button
                    key={mod.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/module/${mod.id}`)}
                    className="glass-card rounded-xl p-5 flex items-start gap-4 hover:border-accent/30 hover:shadow-lg transition-all duration-200 text-left group"
                  >
                    <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <mod.icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-accent font-semibold mb-0.5">Module {mod.id}</p>
                      <p className="font-semibold text-foreground mb-1 leading-snug">{mod.title}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{mod.lessons.length} lessons</span>
                        <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" />{mod.quiz.length} quiz Qs</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {mod.lessons.reduce((a, l) => a + parseInt(l.duration), 0)} min
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-muted-foreground mb-6">Timed practice tests to simulate real exam conditions. Your score and breakdown will be shown at the end.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {practiceTests.map((test, i) => (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl p-6 hover:border-accent/30 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-lg bg-navy flex items-center justify-center">
                        <test.icon className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{test.category}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">{test.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{test.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
                      <span className="flex items-center gap-1"><HelpCircle className="h-3 w-3" />{test.testQuestions.length} questions</span>
                      <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{test.time} min</span>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/test/${test.id}`)}
                    >
                      <Play className="h-4 w-4 mr-1" /> Start Test
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Shield, ArrowLeft, Play, Clock, CheckCircle, Lock,
  BookOpen, Calculator, Brain, Shapes, Languages, FileText, Users
} from "lucide-react";

const moduleData: Record<number, { icon: any; title: string; description: string; lessons: { title: string; duration: string }[] }> = {
  1: {
    icon: BookOpen,
    title: "Understanding the RCMP Aptitude Test",
    description: "Learn the test format, scoring methodology, and develop a strategic approach to maximize your results on test day.",
    lessons: [
      { title: "Test Overview & Format", duration: "12 min" },
      { title: "Scoring Methodology", duration: "10 min" },
      { title: "Time Management Strategies", duration: "15 min" },
      { title: "Test Day Preparation", duration: "8 min" },
    ],
  },
  2: {
    icon: Calculator,
    title: "Numerical Skills",
    description: "Master arithmetic reasoning, data interpretation, and number series through structured practice and proven strategies.",
    lessons: [
      { title: "Basic Arithmetic Review", duration: "15 min" },
      { title: "Fractions & Percentages", duration: "18 min" },
      { title: "Number Series Patterns", duration: "20 min" },
      { title: "Data Interpretation", duration: "15 min" },
      { title: "Word Problems", duration: "18 min" },
      { title: "Speed & Accuracy Tips", duration: "12 min" },
      { title: "Practice Set A", duration: "20 min" },
      { title: "Practice Set B", duration: "20 min" },
    ],
  },
  3: {
    icon: Brain,
    title: "Memory & Observation",
    description: "Develop powerful techniques to recall details from images, text passages, and complex scenarios under time pressure.",
    lessons: [
      { title: "Memory Techniques Overview", duration: "12 min" },
      { title: "Visual Memory Training", duration: "18 min" },
      { title: "Text Recall Strategies", duration: "15 min" },
      { title: "Observation Exercises", duration: "20 min" },
      { title: "Practice Scenarios", duration: "20 min" },
      { title: "Timed Memory Challenge", duration: "15 min" },
    ],
  },
  4: {
    icon: Shapes,
    title: "Spatial Reasoning",
    description: "Practice pattern recognition, shape rotation, mirror images, and visual-spatial problem solving.",
    lessons: [
      { title: "Introduction to Spatial Reasoning", duration: "10 min" },
      { title: "Pattern Recognition", duration: "18 min" },
      { title: "Shape Rotation & Folding", duration: "20 min" },
      { title: "Mirror Images", duration: "15 min" },
      { title: "2D to 3D Visualization", duration: "18 min" },
      { title: "Practice Set A", duration: "15 min" },
      { title: "Practice Set B", duration: "15 min" },
    ],
  },
  5: {
    icon: Languages,
    title: "Language & Logical Reasoning",
    description: "Strengthen verbal comprehension, analogies, syllogisms, and logical deduction skills.",
    lessons: [
      { title: "Verbal Comprehension", duration: "15 min" },
      { title: "Analogies & Relationships", duration: "18 min" },
      { title: "Logical Deduction", duration: "20 min" },
      { title: "Syllogisms", duration: "15 min" },
      { title: "Critical Reasoning", duration: "18 min" },
      { title: "Practice Exercises", duration: "20 min" },
    ],
  },
  6: {
    icon: FileText,
    title: "Full Practice Tests",
    description: "Take timed, full-length RCMP simulation exams with detailed score breakdowns and answer explanations.",
    lessons: [
      { title: "Practice Exam 1", duration: "45 min" },
      { title: "Practice Exam 2", duration: "45 min" },
      { title: "Practice Exam 3", duration: "45 min" },
      { title: "Full Simulation A", duration: "60 min" },
      { title: "Full Simulation B", duration: "60 min" },
    ],
  },
  7: {
    icon: Users,
    title: "Work Style & Professional Judgment",
    description: "Prepare for behavioral and situational assessment questions with real-world law enforcement scenarios.",
    lessons: [
      { title: "Integrity & Accountability", duration: "12 min" },
      { title: "Professional Responsibility", duration: "15 min" },
      { title: "Teamwork & Cooperation", duration: "12 min" },
      { title: "Handling Pressure & Stress", duration: "15 min" },
      { title: "Situational Practice Questions", duration: "20 min" },
    ],
  },
};

const ModuleDetail = () => {
  const { id } = useParams();
  const moduleId = Number(id);
  const mod = moduleData[moduleId];

  if (!mod) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Module not found</h1>
          <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const Icon = mod.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy border-b border-navy-light/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" />
            <span className="font-heading text-lg font-bold text-primary-foreground">AptitudeForge</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        {/* Module header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
              <Icon className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-accent font-semibold">Module {moduleId}</p>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{mod.title}</h1>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">{mod.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {mod.lessons.length} lessons</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {mod.lessons.reduce((acc, l) => acc + parseInt(l.duration), 0)} min total
            </span>
          </div>
        </motion.div>

        {/* Lessons list */}
        <div className="space-y-3">
          {mod.lessons.map((lesson, i) => (
            <motion.div
              key={lesson.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-accent/30 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Play className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{lesson.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> {lesson.duration}
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;

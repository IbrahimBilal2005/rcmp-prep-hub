import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Crown,
  FileText,
  Layers3,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  Video,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import BrandLockup from "@/components/brand/BrandLockup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { modules, practiceTests, type ModuleInfo, type ModuleLesson, type PracticeTest, type QuizQuestion } from "@/data/courseData";
import { clearAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AdminTab = "modules" | "tests" | "users";
type UserStatus = "active" | "invited" | "suspended";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "premium";
  status: UserStatus;
  modulesCompleted: number;
  testAttempts: number;
  lastSeen: string;
}

const cloneQuestion = (question: QuizQuestion): QuizQuestion => ({
  ...question,
  options: [...question.options],
});

const cloneLesson = (lesson: ModuleLesson): ModuleLesson => ({
  ...lesson,
});

const createModuleDrafts = (): ModuleInfo[] =>
  modules.map((module) => ({
    ...module,
    lessons: module.lessons.map(cloneLesson),
    quiz: module.quiz.map(cloneQuestion),
  }));

const createTestDrafts = (): PracticeTest[] =>
  practiceTests.map((test) => ({
    ...test,
    testQuestions: test.testQuestions.map(cloneQuestion),
  }));

const initialUsers: AdminUser[] = [
  {
    id: "user-1",
    name: "Bilal Khan",
    email: "bilal@example.com",
    plan: "premium",
    status: "active",
    modulesCompleted: 5,
    testAttempts: 11,
    lastSeen: "Today, 9:42 AM",
  },
  {
    id: "user-2",
    name: "Sophie Martin",
    email: "sophie@example.com",
    plan: "free",
    status: "active",
    modulesCompleted: 1,
    testAttempts: 2,
    lastSeen: "Today, 7:18 AM",
  },
  {
    id: "user-3",
    name: "Ethan Wright",
    email: "ethan@example.com",
    plan: "premium",
    status: "invited",
    modulesCompleted: 0,
    testAttempts: 0,
    lastSeen: "Invitation pending",
  },
  {
    id: "user-4",
    name: "Maya Chen",
    email: "maya@example.com",
    plan: "premium",
    status: "active",
    modulesCompleted: 7,
    testAttempts: 18,
    lastSeen: "Yesterday, 6:07 PM",
  },
];

const parseMinutes = (duration: string) => Number.parseInt(duration, 10) || 0;

const statusTone: Record<UserStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  invited: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-600 border-red-200",
};

const tabConfig: Array<{ key: AdminTab; label: string; icon: typeof Layers3 }> = [
  { key: "modules", label: "Modules", icon: BookOpen },
  { key: "tests", label: "Practice Tests", icon: FileText },
  { key: "users", label: "Users", icon: Users },
];

const createNewLessonDraft = (lessonNumber = 1): ModuleLesson => ({
  title: `New Lesson ${lessonNumber}`,
  duration: "10 min",
  summary: "Outline what this lecture covers and what the learner should take away.",
  chapterLabel: `Lesson ${String(lessonNumber).padStart(2, "0")}`,
  videoUrl: null,
  posterUrl: null,
});

const createNewQuestionDraft = (): QuizQuestion => ({
  question: "Add a new question prompt.",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctIndex: 0,
  explanation: "Write the explanation learners should see after answering.",
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("modules");
  const [moduleDrafts, setModuleDrafts] = useState<ModuleInfo[]>(() => createModuleDrafts());
  const [testDrafts, setTestDrafts] = useState<PracticeTest[]>(() => createTestDrafts());
  const [userRecords, setUserRecords] = useState<AdminUser[]>(initialUsers);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(modules[0]?.id ?? 1);
  const [selectedTestId, setSelectedTestId] = useState<string>(practiceTests[0]?.id ?? "numerical");
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUsers[0]?.id ?? "");
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [createModuleQuestionOpen, setCreateModuleQuestionOpen] = useState(false);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [createTestQuestionOpen, setCreateTestQuestionOpen] = useState(false);
  const [newModuleDraft, setNewModuleDraft] = useState({ title: "", description: "" });
  const [newLessonDraft, setNewLessonDraft] = useState<ModuleLesson>(() => createNewLessonDraft());
  const [newModuleQuestionDraft, setNewModuleQuestionDraft] = useState<QuizQuestion>(() => createNewQuestionDraft());
  const [newTestDraft, setNewTestDraft] = useState({ title: "", description: "", category: "General", time: 15 });
  const [newTestQuestionDraft, setNewTestQuestionDraft] = useState<QuizQuestion>(() => createNewQuestionDraft());

  const selectedModule = moduleDrafts.find((module) => module.id === selectedModuleId) ?? moduleDrafts[0];

  const selectedTest = testDrafts.find((test) => test.id === selectedTestId) ?? testDrafts[0];

  const selectedUser = userRecords.find((user) => user.id === selectedUserId) ?? userRecords[0];

  const updateSelectedModule = (patch: Partial<ModuleInfo>) => {
    setModuleDrafts((current) =>
      current.map((module) => (module.id === selectedModule.id ? { ...module, ...patch } : module)),
    );
  };

  const updateLesson = (lessonIndex: number, patch: Partial<ModuleLesson>) => {
    setModuleDrafts((current) =>
      current.map((module) =>
        module.id === selectedModule.id
          ? {
              ...module,
              lessons: module.lessons.map((lesson, index) => (index === lessonIndex ? { ...lesson, ...patch } : lesson)),
            }
          : module,
      ),
    );
  };

  const updateModuleQuestion = (questionIndex: number, patch: Partial<QuizQuestion>) => {
    setModuleDrafts((current) =>
      current.map((module) =>
        module.id === selectedModule.id
          ? {
              ...module,
              quiz: module.quiz.map((question, index) => (index === questionIndex ? { ...question, ...patch } : question)),
            }
          : module,
      ),
    );
  };

  const updateModuleQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const nextOptions = [...(selectedModule?.quiz[questionIndex]?.options ?? [])];
    nextOptions[optionIndex] = value;
    updateModuleQuestion(questionIndex, { options: nextOptions });
  };

  const addModule = () => {
    const nextId = Math.max(...moduleDrafts.map((module) => module.id), 0) + 1;
    const nextModule: ModuleInfo = {
      id: nextId,
      icon: BookOpen,
      title: newModuleDraft.title.trim() || `New Module ${nextId}`,
      description: newModuleDraft.description.trim() || "Add a focused module description for the training dashboard.",
      lessons: [],
      quiz: [],
    };

    setModuleDrafts((current) => [...current, nextModule]);
    setSelectedModuleId(nextId);
    setActiveTab("modules");
    setCreateModuleOpen(false);
    setNewModuleDraft({ title: "", description: "" });
  };

  const addLessonToSelectedModule = () => {
    setModuleDrafts((current) =>
      current.map((module) =>
        module.id === selectedModule.id ? { ...module, lessons: [...module.lessons, newLessonDraft] } : module,
      ),
    );
    setCreateLessonOpen(false);
    setNewLessonDraft(createNewLessonDraft(selectedModule.lessons.length + 2));
  };

  const addQuizQuestionToSelectedModule = () => {
    setModuleDrafts((current) =>
      current.map((module) =>
        module.id === selectedModule.id ? { ...module, quiz: [...module.quiz, newModuleQuestionDraft] } : module,
      ),
    );
    setCreateModuleQuestionOpen(false);
    setNewModuleQuestionDraft(createNewQuestionDraft());
  };

  const updateSelectedTest = (patch: Partial<PracticeTest>) => {
    setTestDrafts((current) =>
      current.map((test) => (test.id === selectedTest.id ? { ...test, ...patch } : test)),
    );
  };

  const updateTestQuestion = (questionIndex: number, patch: Partial<QuizQuestion>) => {
    setTestDrafts((current) =>
      current.map((test) =>
        test.id === selectedTest.id
          ? {
              ...test,
              testQuestions: test.testQuestions.map((question, index) =>
                index === questionIndex ? { ...question, ...patch } : question,
              ),
            }
          : test,
      ),
    );
  };

  const updateTestQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const nextOptions = [...(selectedTest?.testQuestions[questionIndex]?.options ?? [])];
    nextOptions[optionIndex] = value;
    updateTestQuestion(questionIndex, { options: nextOptions });
  };

  const addTest = () => {
    const nextTest: PracticeTest = {
      id: `new-test-${testDrafts.length + 1}`,
      title: newTestDraft.title.trim() || `New Practice Test ${testDrafts.length + 1}`,
      description: newTestDraft.description.trim() || "Add the test overview, timing goals, and what this set is designed to measure.",
      questions: 0,
      time: newTestDraft.time,
      category: newTestDraft.category.trim() || "General",
      icon: FileText,
      testQuestions: [],
    };

    setTestDrafts((current) => [...current, nextTest]);
    setSelectedTestId(nextTest.id);
    setActiveTab("tests");
    setCreateTestOpen(false);
    setNewTestDraft({ title: "", description: "", category: "General", time: 15 });
  };

  const addQuestionToSelectedTest = () => {
    setTestDrafts((current) =>
      current.map((test) =>
        test.id === selectedTest.id
          ? {
              ...test,
              questions: test.testQuestions.length + 1,
              testQuestions: [...test.testQuestions, newTestQuestionDraft],
            }
          : test,
      ),
    );
    setCreateTestQuestionOpen(false);
    setNewTestQuestionDraft(createNewQuestionDraft());
  };

  const deleteSelectedModule = () => {
    if (moduleDrafts.length <= 1) {
      return;
    }

    setModuleDrafts((current) => {
      const filtered = current.filter((module) => module.id !== selectedModule.id);
      setSelectedModuleId(filtered[0].id);
      return filtered;
    });
  };

  const deleteLesson = (lessonIndex: number) => {
    setModuleDrafts((current) =>
      current.map((module) =>
        module.id === selectedModule.id
          ? { ...module, lessons: module.lessons.filter((_, index) => index !== lessonIndex) }
          : module,
      ),
    );
  };

  const deleteModuleQuestion = (questionIndex: number) => {
    setModuleDrafts((current) =>
      current.map((module) =>
        module.id === selectedModule.id
          ? { ...module, quiz: module.quiz.filter((_, index) => index !== questionIndex) }
          : module,
      ),
    );
  };

  const deleteSelectedTest = () => {
    if (testDrafts.length <= 1) {
      return;
    }

    setTestDrafts((current) => {
      const filtered = current.filter((test) => test.id !== selectedTest.id);
      setSelectedTestId(filtered[0].id);
      return filtered;
    });
  };

  const deleteTestQuestion = (questionIndex: number) => {
    setTestDrafts((current) =>
      current.map((test) =>
        test.id === selectedTest.id
          ? {
              ...test,
              questions: Math.max(test.testQuestions.length - 1, 0),
              testQuestions: test.testQuestions.filter((_, index) => index !== questionIndex),
            }
          : test,
      ),
    );
  };

  const deleteSelectedUser = () => {
    if (userRecords.length <= 1) {
      return;
    }

    setUserRecords((current) => {
      const filtered = current.filter((user) => user.id !== selectedUser.id);
      setSelectedUserId(filtered[0].id);
      return filtered;
    });
  };

  const updateUser = (patch: Partial<AdminUser>) => {
    setUserRecords((current) => current.map((user) => (user.id === selectedUser.id ? { ...user, ...patch } : user)));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="app-shell flex h-16 items-center justify-between gap-4">
          <Link to="/" className="min-w-0">
            <BrandLockup size="sm" subtitle="Admin Dashboard" textClassName="text-foreground" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                clearAuthSession();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="app-shell py-8 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Admin workspace</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground">Manage course content, tests, and users</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Use this screen to maintain the training library, lesson watch pages, timed tests, and account access in one place.
          </p>
        </div>

        <div className="flex max-w-3xl gap-1 rounded-2xl bg-muted p-1">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "modules" && selectedModule && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="glass-card rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Module library</p>
                  <p className="mt-2 text-lg font-heading font-semibold text-foreground">{moduleDrafts.length} modules</p>
                </div>
                <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="h-4 w-4" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl text-foreground">Create module</DialogTitle>
                      <DialogDescription>Add the module title and overview first, then fill in lessons and quiz content afterward.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Module title</label>
                        <Input value={newModuleDraft.title} onChange={(event) => setNewModuleDraft((current) => ({ ...current, title: event.target.value }))} className="bg-background/70" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <Textarea value={newModuleDraft.description} onChange={(event) => setNewModuleDraft((current) => ({ ...current, description: event.target.value }))} className="min-h-[120px] bg-background/70" />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setCreateModuleOpen(false)}>Cancel</Button>
                        <Button variant="hero" onClick={addModule}>Create module</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {moduleDrafts.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setSelectedModuleId(module.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                      module.id === selectedModule.id ? "border-accent/35 bg-accent/5 shadow-sm" : "border-border/60 bg-card hover:border-accent/20",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-accent">Module {module.id}</p>
                        <p className="mt-1 font-semibold text-foreground">{module.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{module.lessons.length} lessons</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-6">
              <section className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Module settings</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">{selectedModule.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                          Edit module
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                        <DialogHeader>
                          <DialogTitle className="font-heading text-2xl text-foreground">Edit module</DialogTitle>
                          <DialogDescription>Update the module title and overview details here.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Module title</label>
                            <Input value={selectedModule.title} onChange={(event) => updateSelectedModule({ title: event.target.value })} className="bg-background/70" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Module description</label>
                            <Textarea value={selectedModule.description} onChange={(event) => updateSelectedModule({ description: event.target.value })} className="min-h-[140px] bg-background/70" />
                          </div>
                          <div className="flex justify-end gap-3">
                            <DialogClose asChild>
                              <Button variant="outline">Done</Button>
                            </DialogClose>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={moduleDrafts.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                          Delete module
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this module?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove the module, its lesson list, and its quiz items from the admin mockup.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteSelectedModule}>Delete module</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Lessons</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{selectedModule.lessons.length}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quiz questions</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{selectedModule.quiz.length}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Estimated minutes</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{selectedModule.lessons.reduce((total, lesson) => total + parseMinutes(lesson.duration), 0)} min</p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-muted-foreground">Use the module editor to update the name and overview, then manage lectures and checkpoint questions below.</p>
              </section>

              <section className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Lesson management</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold text-foreground">{selectedModule.lessons.length} lectures</h3>
                  </div>
                  <Dialog
                    open={createLessonOpen}
                    onOpenChange={(open) => {
                      setCreateLessonOpen(open);
                      if (open) {
                        setNewLessonDraft(createNewLessonDraft(selectedModule.lessons.length + 1));
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Add lecture
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl text-foreground">Create lecture</DialogTitle>
                        <DialogDescription>Add the lecture metadata before it appears in the module list.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Lesson title</label>
                          <Input value={newLessonDraft.title} onChange={(event) => setNewLessonDraft((current) => ({ ...current, title: event.target.value }))} className="bg-background/70" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Duration</label>
                          <Input value={newLessonDraft.duration} onChange={(event) => setNewLessonDraft((current) => ({ ...current, duration: event.target.value }))} className="bg-background/70" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Chapter label</label>
                          <Input value={newLessonDraft.chapterLabel} onChange={(event) => setNewLessonDraft((current) => ({ ...current, chapterLabel: event.target.value }))} className="bg-background/70" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Video URL</label>
                          <Input value={newLessonDraft.videoUrl ?? ""} onChange={(event) => setNewLessonDraft((current) => ({ ...current, videoUrl: event.target.value || null }))} className="bg-background/70" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium text-foreground">Summary</label>
                          <Textarea value={newLessonDraft.summary} onChange={(event) => setNewLessonDraft((current) => ({ ...current, summary: event.target.value }))} className="min-h-[140px] bg-background/70" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium text-foreground">Poster image URL</label>
                          <Input value={newLessonDraft.posterUrl ?? ""} onChange={(event) => setNewLessonDraft((current) => ({ ...current, posterUrl: event.target.value || null }))} className="bg-background/70" />
                        </div>
                        <div className="flex justify-end gap-3 sm:col-span-2">
                          <Button variant="outline" onClick={() => setCreateLessonOpen(false)}>Cancel</Button>
                          <Button variant="hero" onClick={addLessonToSelectedModule}>Create lecture</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {selectedModule.lessons.map((lesson, index) => (
                    <div key={`${lesson.chapterLabel}-${index}`} className="rounded-2xl border border-border/60 bg-card px-4 py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{lesson.chapterLabel}</p>
                          <p className="mt-1 font-semibold text-foreground">{lesson.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{lesson.duration}</span>
                            <span>{lesson.videoUrl ? "Video URL set" : "Video URL pending"}</span>
                            <span>{lesson.posterUrl ? "Poster set" : "Poster pending"}</span>
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{lesson.summary}</p>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="sm:shrink-0">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                            <DialogHeader>
                              <DialogTitle className="font-heading text-2xl text-foreground">Edit lesson</DialogTitle>
                              <DialogDescription>
                                Update the lesson card and the lesson watch page fields from one place.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Lesson title</label>
                                <Input value={lesson.title} onChange={(event) => updateLesson(index, { title: event.target.value })} className="bg-background/70" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Duration</label>
                                <Input value={lesson.duration} onChange={(event) => updateLesson(index, { duration: event.target.value })} className="bg-background/70" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Chapter label</label>
                                <Input value={lesson.chapterLabel} onChange={(event) => updateLesson(index, { chapterLabel: event.target.value })} className="bg-background/70" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Video URL</label>
                                <Input value={lesson.videoUrl ?? ""} onChange={(event) => updateLesson(index, { videoUrl: event.target.value || null })} placeholder="https://..." className="bg-background/70" />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-foreground">Summary</label>
                                <Textarea value={lesson.summary} onChange={(event) => updateLesson(index, { summary: event.target.value })} className="min-h-[140px] bg-background/70" />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-foreground">Poster image URL</label>
                                <Input value={lesson.posterUrl ?? ""} onChange={(event) => updateLesson(index, { posterUrl: event.target.value || null })} placeholder="Poster URL" className="bg-background/70" />
                              </div>
                              <div className="flex justify-between gap-3 sm:col-span-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                      Delete lecture
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this lecture?</AlertDialogTitle>
                                      <AlertDialogDescription>This lecture will be removed from the selected module in the admin mockup.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteLesson(index)}>Delete lecture</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <DialogClose asChild>
                                  <Button variant="outline">Done</Button>
                                </DialogClose>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Module quiz management</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold text-foreground">{selectedModule.quiz.length} checkpoint questions</h3>
                  </div>
                  <Dialog open={createModuleQuestionOpen} onOpenChange={setCreateModuleQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Add question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl text-foreground">Create module question</DialogTitle>
                        <DialogDescription>Add the prompt, answers, and explanation before it is saved to the quiz bank.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Question prompt</label>
                          <Textarea value={newModuleQuestionDraft.question} onChange={(event) => setNewModuleQuestionDraft((current) => ({ ...current, question: event.target.value }))} className="min-h-[120px] bg-background/70" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {newModuleQuestionDraft.options.map((option, optionIndex) => (
                            <div key={`new-module-option-${optionIndex}`} className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Option {String.fromCharCode(65 + optionIndex)}</label>
                              <Input
                                value={option}
                                onChange={(event) => {
                                  const nextOptions = [...newModuleQuestionDraft.options];
                                  nextOptions[optionIndex] = event.target.value;
                                  setNewModuleQuestionDraft((current) => ({ ...current, options: nextOptions }));
                                }}
                                className="bg-background/70"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Correct option index</label>
                            <Input type="number" min={0} max={newModuleQuestionDraft.options.length - 1} value={newModuleQuestionDraft.correctIndex} onChange={(event) => setNewModuleQuestionDraft((current) => ({ ...current, correctIndex: Number(event.target.value) || 0 }))} className="bg-background/70" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Explanation</label>
                            <Textarea value={newModuleQuestionDraft.explanation} onChange={(event) => setNewModuleQuestionDraft((current) => ({ ...current, explanation: event.target.value }))} className="min-h-[120px] bg-background/70" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setCreateModuleQuestionOpen(false)}>Cancel</Button>
                          <Button variant="hero" onClick={addQuizQuestionToSelectedModule}>Create question</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {selectedModule.quiz.map((question, questionIndex) => (
                    <div key={`${selectedModule.id}-quiz-${questionIndex}`} className="rounded-2xl border border-border/60 bg-card px-4 py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Question {questionIndex + 1}</p>
                          <p className="mt-1 font-semibold text-foreground">{question.question}</p>
                          <p className="mt-2 text-xs text-muted-foreground">Correct answer: {String.fromCharCode(65 + question.correctIndex)}</p>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="sm:shrink-0">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                            <DialogHeader>
                              <DialogTitle className="font-heading text-2xl text-foreground">Edit module question</DialogTitle>
                              <DialogDescription>
                                Update the checkpoint prompt, answer options, and explanation.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Question prompt</label>
                                <Textarea value={question.question} onChange={(event) => updateModuleQuestion(questionIndex, { question: event.target.value })} className="min-h-[120px] bg-background/70" />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={`${selectedModule.id}-${questionIndex}-${optionIndex}`} className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Option {String.fromCharCode(65 + optionIndex)}</label>
                                    <Input value={option} onChange={(event) => updateModuleQuestionOption(questionIndex, optionIndex, event.target.value)} className="bg-background/70" />
                                  </div>
                                ))}
                              </div>
                              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">Correct option index</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={question.options.length - 1}
                                    value={question.correctIndex}
                                    onChange={(event) => updateModuleQuestion(questionIndex, { correctIndex: Number(event.target.value) || 0 })}
                                    className="bg-background/70"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">Explanation</label>
                                  <Textarea value={question.explanation} onChange={(event) => updateModuleQuestion(questionIndex, { explanation: event.target.value })} className="min-h-[120px] bg-background/70" />
                                </div>
                              </div>
                              <div className="flex justify-between gap-3">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                      Delete question
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this module question?</AlertDialogTitle>
                                      <AlertDialogDescription>This checkpoint question will be removed from the selected module.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteModuleQuestion(questionIndex)}>Delete question</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <DialogClose asChild>
                                  <Button variant="outline">Done</Button>
                                </DialogClose>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === "tests" && selectedTest && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="glass-card rounded-3xl p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Test library</p>
                    <p className="mt-2 text-lg font-heading font-semibold text-foreground">{testDrafts.length} timed tests</p>
                  </div>
                <Dialog open={createTestOpen} onOpenChange={setCreateTestOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="h-4 w-4" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-2xl text-foreground">Create practice test</DialogTitle>
                      <DialogDescription>Add the core metadata first, then build the question bank inside the test editor.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Test title</label>
                        <Input value={newTestDraft.title} onChange={(event) => setNewTestDraft((current) => ({ ...current, title: event.target.value }))} className="bg-background/70" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Category</label>
                        <Input value={newTestDraft.category} onChange={(event) => setNewTestDraft((current) => ({ ...current, category: event.target.value }))} className="bg-background/70" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Time limit (minutes)</label>
                        <Input type="number" min={1} value={newTestDraft.time} onChange={(event) => setNewTestDraft((current) => ({ ...current, time: Number(event.target.value) || 1 }))} className="bg-background/70" />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <Textarea value={newTestDraft.description} onChange={(event) => setNewTestDraft((current) => ({ ...current, description: event.target.value }))} className="min-h-[120px] bg-background/70" />
                      </div>
                      <div className="flex justify-end gap-3 sm:col-span-2">
                        <Button variant="outline" onClick={() => setCreateTestOpen(false)}>Cancel</Button>
                        <Button variant="hero" onClick={addTest}>Create test</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {testDrafts.map((test) => (
                  <button
                    key={test.id}
                    type="button"
                    onClick={() => setSelectedTestId(test.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                      test.id === selectedTest.id ? "border-accent/35 bg-accent/5 shadow-sm" : "border-border/60 bg-card hover:border-accent/20",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-accent">{test.category}</p>
                        <p className="mt-1 font-semibold text-foreground">{test.title}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{test.testQuestions.length} Qs</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-6">
              <section className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Test settings</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">{selectedTest.title}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                          Edit test
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                        <DialogHeader>
                          <DialogTitle className="font-heading text-2xl text-foreground">Edit practice test</DialogTitle>
                          <DialogDescription>Update the test title, category, timing, and overview here.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Test title</label>
                            <Input value={selectedTest.title} onChange={(event) => updateSelectedTest({ title: event.target.value })} className="bg-background/70" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Category</label>
                            <Input value={selectedTest.category} onChange={(event) => updateSelectedTest({ category: event.target.value })} className="bg-background/70" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Time limit (minutes)</label>
                            <Input type="number" min={1} value={selectedTest.time} onChange={(event) => updateSelectedTest({ time: Number(event.target.value) || 1 })} className="bg-background/70" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Displayed question count</label>
                            <Input type="number" min={1} value={selectedTest.questions} onChange={(event) => updateSelectedTest({ questions: Number(event.target.value) || 1 })} className="bg-background/70" />
                          </div>
                          <div className="space-y-2 lg:col-span-2">
                            <label className="text-sm font-medium text-foreground">Test description</label>
                            <Textarea value={selectedTest.description} onChange={(event) => updateSelectedTest({ description: event.target.value })} className="min-h-[120px] bg-background/70" />
                          </div>
                          <div className="flex justify-end gap-3 lg:col-span-2">
                            <DialogClose asChild>
                              <Button variant="outline">Done</Button>
                            </DialogClose>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={testDrafts.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                          Delete test
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this practice test?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove the test and its full question bank from the admin mockup.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteSelectedTest}>Delete test</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Time limit</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{selectedTest.time} min</p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Question count</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{selectedTest.testQuestions.length}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Category</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{selectedTest.category}</p>
                  </div>
                </div>

                <p className="text-sm leading-7 text-muted-foreground">Use the test editor to update the test name, category, time limit, and overview, then manage the question bank below.</p>
              </section>

              <section className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Question management</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold text-foreground">{selectedTest.testQuestions.length} questions</h3>
                  </div>
                  <Dialog open={createTestQuestionOpen} onOpenChange={setCreateTestQuestionOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                        Add question
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                      <DialogHeader>
                        <DialogTitle className="font-heading text-2xl text-foreground">Create test question</DialogTitle>
                        <DialogDescription>Add the timed-test prompt, answer options, and explanation before saving it.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Question prompt</label>
                          <Textarea value={newTestQuestionDraft.question} onChange={(event) => setNewTestQuestionDraft((current) => ({ ...current, question: event.target.value }))} className="min-h-[120px] bg-background/70" />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {newTestQuestionDraft.options.map((option, optionIndex) => (
                            <div key={`new-test-option-${optionIndex}`} className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Option {String.fromCharCode(65 + optionIndex)}</label>
                              <Input
                                value={option}
                                onChange={(event) => {
                                  const nextOptions = [...newTestQuestionDraft.options];
                                  nextOptions[optionIndex] = event.target.value;
                                  setNewTestQuestionDraft((current) => ({ ...current, options: nextOptions }));
                                }}
                                className="bg-background/70"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Correct option index</label>
                            <Input type="number" min={0} max={newTestQuestionDraft.options.length - 1} value={newTestQuestionDraft.correctIndex} onChange={(event) => setNewTestQuestionDraft((current) => ({ ...current, correctIndex: Number(event.target.value) || 0 }))} className="bg-background/70" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Explanation</label>
                            <Textarea value={newTestQuestionDraft.explanation} onChange={(event) => setNewTestQuestionDraft((current) => ({ ...current, explanation: event.target.value }))} className="min-h-[120px] bg-background/70" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={() => setCreateTestQuestionOpen(false)}>Cancel</Button>
                          <Button variant="hero" onClick={addQuestionToSelectedTest}>Create question</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {selectedTest.testQuestions.map((question, questionIndex) => (
                    <div key={`${selectedTest.id}-${questionIndex}`} className="rounded-2xl border border-border/60 bg-card px-4 py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Question {questionIndex + 1}</p>
                          <p className="mt-1 font-semibold text-foreground">{question.question}</p>
                          <p className="mt-2 text-xs text-muted-foreground">Correct answer: {String.fromCharCode(65 + question.correctIndex)}</p>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="sm:shrink-0">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl rounded-[1.75rem] border-border/70 p-6 sm:p-7">
                            <DialogHeader>
                              <DialogTitle className="font-heading text-2xl text-foreground">Edit test question</DialogTitle>
                              <DialogDescription>
                                Update the prompt, options, and answer review content for this timed test.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Question prompt</label>
                                <Textarea value={question.question} onChange={(event) => updateTestQuestion(questionIndex, { question: event.target.value })} className="min-h-[120px] bg-background/70" />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={`${selectedTest.id}-${questionIndex}-${optionIndex}`} className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Option {String.fromCharCode(65 + optionIndex)}</label>
                                    <Input value={option} onChange={(event) => updateTestQuestionOption(questionIndex, optionIndex, event.target.value)} className="bg-background/70" />
                                  </div>
                                ))}
                              </div>
                              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">Correct option index</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={question.options.length - 1}
                                    value={question.correctIndex}
                                    onChange={(event) => updateTestQuestion(questionIndex, { correctIndex: Number(event.target.value) || 0 })}
                                    className="bg-background/70"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-foreground">Explanation</label>
                                  <Textarea value={question.explanation} onChange={(event) => updateTestQuestion(questionIndex, { explanation: event.target.value })} className="min-h-[120px] bg-background/70" />
                                </div>
                              </div>
                              <div className="flex justify-between gap-3">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                      Delete question
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete this test question?</AlertDialogTitle>
                                      <AlertDialogDescription>This question will be removed from the selected timed test.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTestQuestion(questionIndex)}>Delete question</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <DialogClose asChild>
                                  <Button variant="outline">Done</Button>
                                </DialogClose>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && selectedUser && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="glass-card rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">User list</p>
                  <p className="mt-2 text-lg font-heading font-semibold text-foreground">{userRecords.length} learners</p>
                </div>
                <Users className="h-5 w-5 text-accent" />
              </div>

              <div className="space-y-3">
                {userRecords.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                      user.id === selectedUser.id ? "border-accent/35 bg-accent/5 shadow-sm" : "border-border/60 bg-card hover:border-accent/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", statusTone[user.status])}>
                        {user.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-6">
              <section className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Account details</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">{selectedUser.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("border", selectedUser.plan === "premium" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-card text-foreground")}>
                      {selectedUser.plan === "premium" ? <Crown className="mr-1 h-3.5 w-3.5" /> : null}
                      {selectedUser.plan}
                    </Badge>
                    <Badge className={cn("border", statusTone[selectedUser.status])}>{selectedUser.status}</Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={userRecords.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                          Delete user
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                          <AlertDialogDescription>This removes the user record from the admin mockup list.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteSelectedUser}>Delete user</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Modules completed</p>
                    <p className="mt-3 font-heading text-3xl font-bold text-foreground">{selectedUser.modulesCompleted}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Test attempts</p>
                    <p className="mt-3 font-heading text-3xl font-bold text-foreground">{selectedUser.testAttempts}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last seen</p>
                    <p className="mt-3 text-sm font-semibold text-foreground">{selectedUser.lastSeen}</p>
                  </div>
                </div>
              </section>

              <section className="glass-card rounded-3xl p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Access controls</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        variant={selectedUser.plan === "premium" ? "hero" : "outline"}
                        size="sm"
                        onClick={() => updateUser({ plan: "premium" })}
                      >
                        <Crown className="h-4 w-4" />
                        Set premium
                      </Button>
                      <Button
                        variant={selectedUser.plan === "free" ? "hero" : "outline"}
                        size="sm"
                        onClick={() => updateUser({ plan: "free" })}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Set free
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Status</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {(["active", "invited", "suspended"] as UserStatus[]).map((status) => (
                        <Button
                          key={status}
                          variant={selectedUser.status === status ? "hero" : "outline"}
                          size="sm"
                          onClick={() => updateUser({ status })}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Support actions</p>
                    <div className="mt-4 space-y-3 text-sm text-foreground">
                      <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3">
                        <Mail className="h-4 w-4 text-accent" />
                        Send reset or onboarding email
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Move the account between free and premium access
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Why this matters</p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      User management ties directly into the same access model the learner dashboards already use, so plan changes and account status remain easy to reason about when this is wired to Supabase later.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;

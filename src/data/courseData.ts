import { BookOpen, Calculator, Brain, Shapes, Languages, FileText, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleInfo {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
  lessons: { title: string; duration: string }[];
  quiz: QuizQuestion[];
}

export interface PracticeTest {
  id: string;
  title: string;
  description: string;
  questions: number;
  time: number; // minutes
  category: string;
  icon: LucideIcon;
  testQuestions: QuizQuestion[];
}

export const modules: ModuleInfo[] = [
  {
    id: 1, icon: BookOpen,
    title: "Understanding the RCMP Aptitude Test",
    description: "Learn the test format, scoring methodology, and develop a strategic approach to maximize your results on test day.",
    lessons: [
      { title: "Test Overview & Format", duration: "12 min" },
      { title: "Scoring Methodology", duration: "10 min" },
      { title: "Time Management Strategies", duration: "15 min" },
      { title: "Test Day Preparation", duration: "8 min" },
    ],
    quiz: [
      { question: "How many sections does the RCMP aptitude test typically contain?", options: ["3", "5", "7", "10"], correctIndex: 1, explanation: "The RCMP aptitude test typically contains 5 main sections covering different cognitive abilities." },
      { question: "What is the best strategy when you encounter a difficult question?", options: ["Spend extra time on it", "Skip it and return later", "Guess randomly", "Leave it blank"], correctIndex: 1, explanation: "Skipping difficult questions and returning later ensures you answer all easier questions first, maximizing your score." },
      { question: "Which of the following is NOT typically assessed in the RCMP aptitude test?", options: ["Numerical reasoning", "Physical fitness", "Memory recall", "Spatial reasoning"], correctIndex: 1, explanation: "Physical fitness is assessed separately. The aptitude test focuses on cognitive abilities." },
    ],
  },
  {
    id: 2, icon: Calculator,
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
    quiz: [
      { question: "What is 15% of 240?", options: ["30", "36", "42", "48"], correctIndex: 1, explanation: "15% of 240 = 0.15 × 240 = 36." },
      { question: "Complete the series: 2, 6, 18, 54, __", options: ["108", "162", "72", "216"], correctIndex: 1, explanation: "Each number is multiplied by 3. 54 × 3 = 162." },
      { question: "A car travels 180 km in 2.5 hours. What is its average speed?", options: ["60 km/h", "72 km/h", "80 km/h", "90 km/h"], correctIndex: 1, explanation: "Average speed = 180 ÷ 2.5 = 72 km/h." },
      { question: "If 3x + 7 = 22, what is x?", options: ["3", "5", "7", "15"], correctIndex: 1, explanation: "3x = 22 - 7 = 15, so x = 15 ÷ 3 = 5." },
    ],
  },
  {
    id: 3, icon: Brain,
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
    quiz: [
      { question: "Which memory technique involves creating a mental journey through familiar locations?", options: ["Chunking", "Method of Loci", "Spaced Repetition", "Mnemonics"], correctIndex: 1, explanation: "The Method of Loci (Memory Palace) involves placing items to remember along a familiar route." },
      { question: "What is 'chunking' in the context of memory?", options: ["Breaking info into smaller groups", "Memorizing one item at a time", "Forgetting irrelevant details", "Speed reading"], correctIndex: 0, explanation: "Chunking involves grouping individual pieces of information into larger, meaningful units." },
      { question: "When observing a scene, what should you focus on first?", options: ["Colors only", "People's faces", "Overall layout then specific details", "Random elements"], correctIndex: 2, explanation: "Start with the big picture (overall layout) then systematically note specific details." },
    ],
  },
  {
    id: 4, icon: Shapes,
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
    quiz: [
      { question: "When a shape is rotated 180°, which property always stays the same?", options: ["Position", "Orientation", "Size and shape", "Color only"], correctIndex: 2, explanation: "Rotation preserves size and shape (congruence). Only position and orientation change." },
      { question: "A mirror image is also called a:", options: ["Translation", "Rotation", "Reflection", "Dilation"], correctIndex: 2, explanation: "A mirror image is a reflection — flipping the shape across an axis." },
      { question: "How many faces does a cube have?", options: ["4", "6", "8", "12"], correctIndex: 1, explanation: "A cube has 6 faces, 12 edges, and 8 vertices." },
    ],
  },
  {
    id: 5, icon: Languages,
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
    quiz: [
      { question: "'Hot' is to 'Cold' as 'Up' is to:", options: ["Left", "Down", "High", "Over"], correctIndex: 1, explanation: "Hot and Cold are antonyms, so the antonym of Up is Down." },
      { question: "All dogs are animals. Some animals are pets. Therefore:", options: ["All dogs are pets", "Some dogs are pets", "No valid conclusion", "All pets are dogs"], correctIndex: 2, explanation: "We cannot conclude that dogs are pets from these premises — it's a logical fallacy." },
      { question: "Which word does NOT belong: Apple, Banana, Carrot, Grape?", options: ["Apple", "Banana", "Carrot", "Grape"], correctIndex: 2, explanation: "Carrot is a vegetable; the others are all fruits." },
    ],
  },
  {
    id: 6, icon: FileText,
    title: "Full Practice Tests",
    description: "Take timed, full-length RCMP simulation exams with detailed score breakdowns and answer explanations.",
    lessons: [
      { title: "Practice Exam 1", duration: "45 min" },
      { title: "Practice Exam 2", duration: "45 min" },
      { title: "Practice Exam 3", duration: "45 min" },
      { title: "Full Simulation A", duration: "60 min" },
      { title: "Full Simulation B", duration: "60 min" },
    ],
    quiz: [
      { question: "What is the recommended approach for a timed test?", options: ["Answer in order no matter what", "Read all questions first then answer", "Answer easy ones first, return to hard ones", "Spend equal time on every question"], correctIndex: 2, explanation: "Answering easy questions first builds confidence and ensures you don't miss points on questions you know." },
      { question: "If you finish a section early, what should you do?", options: ["Submit immediately", "Review your answers", "Start daydreaming", "Skip to next section"], correctIndex: 1, explanation: "Always review your answers if time permits — you may catch errors or remember answers to skipped questions." },
    ],
  },
  {
    id: 7, icon: Users,
    title: "Work Style & Professional Judgment",
    description: "Prepare for behavioral and situational assessment questions with real-world law enforcement scenarios.",
    lessons: [
      { title: "Integrity & Accountability", duration: "12 min" },
      { title: "Professional Responsibility", duration: "15 min" },
      { title: "Teamwork & Cooperation", duration: "12 min" },
      { title: "Handling Pressure & Stress", duration: "15 min" },
      { title: "Situational Practice Questions", duration: "20 min" },
    ],
    quiz: [
      { question: "You notice a colleague taking office supplies home without permission. What would you most likely do?", options: ["Ignore it", "Confront them aggressively", "Report the behavior through proper channels", "Join them"], correctIndex: 2, explanation: "Law enforcement roles emphasize integrity and accountability. Reporting through proper channels is the professional response." },
      { question: "A member of the public is being verbally aggressive toward you during a routine interaction. What is the best response?", options: ["Respond with equal aggression", "Walk away without explanation", "Remain calm and professional while de-escalating", "Threaten to arrest them"], correctIndex: 2, explanation: "De-escalation and maintaining professionalism are key competencies in law enforcement." },
      { question: "You discover a minor error in a report filed by a senior officer. What should you do?", options: ["Ignore it to avoid conflict", "Correct it yourself without telling anyone", "Bring it to the officer's attention respectfully", "Report them to internal affairs"], correctIndex: 2, explanation: "Respectfully bringing errors to attention shows integrity while maintaining professional relationships." },
    ],
  },
];

export const practiceTests: PracticeTest[] = [
  {
    id: "numerical",
    title: "Numerical Reasoning",
    description: "Test your arithmetic, data interpretation, and number series skills.",
    questions: 10,
    time: 15,
    category: "Numerical",
    icon: Calculator,
    testQuestions: [
      { question: "What is 25% of 360?", options: ["80", "90", "100", "72"], correctIndex: 1, explanation: "25% of 360 = 0.25 × 360 = 90." },
      { question: "Complete the series: 3, 9, 27, 81, __", options: ["162", "243", "108", "324"], correctIndex: 1, explanation: "Each number is multiplied by 3. 81 × 3 = 243." },
      { question: "If a store offers a 20% discount on a $75 item, what is the sale price?", options: ["$55", "$60", "$65", "$50"], correctIndex: 1, explanation: "20% of $75 = $15. Sale price = $75 - $15 = $60." },
      { question: "What is 144 ÷ 12?", options: ["11", "12", "13", "14"], correctIndex: 1, explanation: "144 ÷ 12 = 12." },
      { question: "A train travels at 90 km/h. How far does it travel in 40 minutes?", options: ["50 km", "60 km", "45 km", "70 km"], correctIndex: 1, explanation: "40 minutes = 2/3 hour. Distance = 90 × 2/3 = 60 km." },
      { question: "What is the next prime number after 13?", options: ["14", "15", "17", "19"], correctIndex: 2, explanation: "14 is divisible by 2, 15 by 3, 16 by 2. 17 is the next prime after 13." },
      { question: "If 5 workers can complete a job in 8 days, how many days will 10 workers take?", options: ["4 days", "16 days", "2 days", "6 days"], correctIndex: 0, explanation: "Double the workers = half the time. 8 ÷ 2 = 4 days." },
      { question: "What is 3² + 4²?", options: ["24", "25", "7", "49"], correctIndex: 1, explanation: "3² + 4² = 9 + 16 = 25." },
      { question: "A recipe calls for 2 cups of flour for 12 cookies. How many cups for 30 cookies?", options: ["4", "5", "6", "3"], correctIndex: 1, explanation: "30/12 × 2 = 2.5 × 2 = 5 cups." },
      { question: "What is the average of 15, 20, 25, and 40?", options: ["20", "25", "30", "35"], correctIndex: 1, explanation: "Sum = 100. Average = 100 ÷ 4 = 25." },
    ],
  },
  {
    id: "memory",
    title: "Memory & Observation",
    description: "Test your ability to recall details and observe patterns.",
    questions: 8,
    time: 12,
    category: "Memory",
    icon: Brain,
    testQuestions: [
      { question: "A witness describes a suspect wearing a blue jacket, black jeans, and white sneakers. Which detail was mentioned?", options: ["Red hat", "Blue jacket", "Brown boots", "Green shirt"], correctIndex: 1, explanation: "The witness specifically mentioned a blue jacket." },
      { question: "In a sequence of events: John arrived at 3pm, Mary at 3:15pm, Tom at 2:45pm. Who arrived first?", options: ["John", "Mary", "Tom", "They arrived simultaneously"], correctIndex: 2, explanation: "Tom arrived at 2:45pm, which is the earliest time." },
      { question: "A vehicle plate reads 'ABC 1234'. What is the third letter?", options: ["A", "B", "C", "D"], correctIndex: 2, explanation: "The third letter in 'ABC' is C." },
      { question: "You observe 5 people in a room: 2 are sitting, 1 is standing by the window, and 2 are at the door. How many are NOT sitting?", options: ["2", "3", "4", "5"], correctIndex: 1, explanation: "5 total - 2 sitting = 3 not sitting." },
      { question: "A report mentions the incident occurred on 'Tuesday, March 15th at 14:30'. What day was it?", options: ["Monday", "Tuesday", "Wednesday", "Thursday"], correctIndex: 1, explanation: "The report clearly states Tuesday." },
      { question: "In a lineup of 6 people, the tallest is in position 3 and the shortest in position 6. Which position has the tallest?", options: ["1", "3", "5", "6"], correctIndex: 1, explanation: "The tallest person is in position 3 as stated." },
      { question: "A street address is 4872 Oak Avenue. What are the last two digits of the number?", options: ["48", "72", "87", "42"], correctIndex: 1, explanation: "The last two digits of 4872 are 72." },
      { question: "Three cars are parked: a red sedan, a blue SUV, and a white truck. Which vehicle is an SUV?", options: ["Red", "Blue", "White", "None"], correctIndex: 1, explanation: "The blue vehicle is described as an SUV." },
    ],
  },
  {
    id: "language",
    title: "Language Reasoning",
    description: "Test verbal comprehension, analogies, and logical deduction.",
    questions: 10,
    time: 15,
    category: "Language",
    icon: Languages,
    testQuestions: [
      { question: "'Brave' is most similar in meaning to:", options: ["Scared", "Courageous", "Cautious", "Reckless"], correctIndex: 1, explanation: "Courageous is the closest synonym to brave." },
      { question: "'Book' is to 'Library' as 'Painting' is to:", options: ["Artist", "Museum", "Canvas", "Brush"], correctIndex: 1, explanation: "Books are found in libraries; paintings are found in museums." },
      { question: "Which word is the opposite of 'transparent'?", options: ["Clear", "Opaque", "Visible", "Bright"], correctIndex: 1, explanation: "Opaque means not transparent — light cannot pass through." },
      { question: "All roses are flowers. All flowers need water. Therefore:", options: ["All water needs roses", "All roses need water", "Some flowers are roses", "Water is a rose"], correctIndex: 1, explanation: "If all roses are flowers and all flowers need water, then all roses need water (transitive logic)." },
      { question: "Choose the word that does NOT belong: Swift, Quick, Rapid, Heavy", options: ["Swift", "Quick", "Rapid", "Heavy"], correctIndex: 3, explanation: "Heavy relates to weight; the others all mean fast." },
      { question: "If APPLE is coded as BQQMF, what is BEAR coded as?", options: ["CFBS", "CDBS", "CFAS", "CABS"], correctIndex: 0, explanation: "Each letter shifts forward by 1: B→C, E→F, A→B, R→S = CFBS." },
      { question: "'Nocturnal' most likely describes an animal that:", options: ["Lives in water", "Is active at night", "Eats plants", "Migrates south"], correctIndex: 1, explanation: "Nocturnal means active during the night." },
      { question: "Which sentence is grammatically correct?", options: ["Him and me went.", "He and I went.", "Me and him went.", "I and he went."], correctIndex: 1, explanation: "'He and I' is the correct subject pronoun usage." },
      { question: "'Benevolent' most closely means:", options: ["Harmful", "Kind and generous", "Indifferent", "Strict"], correctIndex: 1, explanation: "Benevolent means well-meaning and kindly; generous." },
      { question: "If no cats are dogs, and some pets are cats, which is true?", options: ["No pets are dogs", "Some pets are not dogs", "All cats are pets", "All dogs are pets"], correctIndex: 1, explanation: "Since some pets are cats, and no cats are dogs, those pet-cats are not dogs — so some pets are not dogs." },
    ],
  },
  {
    id: "spatial",
    title: "Spatial Reasoning",
    description: "Test pattern recognition, rotation, and visual-spatial skills.",
    questions: 8,
    time: 12,
    category: "Spatial",
    icon: Shapes,
    testQuestions: [
      { question: "If you rotate the letter 'N' 180°, what does it look like?", options: ["N", "Z", "N (same)", "U"], correctIndex: 2, explanation: "The letter N rotated 180° looks like the same letter N." },
      { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correctIndex: 1, explanation: "A hexagon has 6 sides (hex = six)." },
      { question: "A square piece of paper is folded in half, then in half again. How many layers are there?", options: ["2", "3", "4", "8"], correctIndex: 2, explanation: "First fold: 2 layers. Second fold: 4 layers." },
      { question: "Which shape has all sides equal and all angles equal to 60°?", options: ["Square", "Equilateral triangle", "Pentagon", "Rhombus"], correctIndex: 1, explanation: "An equilateral triangle has all sides equal and all angles equal to 60°." },
      { question: "If you look at a clock in a mirror showing 3:00, what time does the mirror show?", options: ["3:00", "9:00", "6:00", "12:00"], correctIndex: 1, explanation: "A mirror reflection of 3:00 appears as 9:00." },
      { question: "How many edges does a rectangular prism (box) have?", options: ["8", "10", "12", "14"], correctIndex: 2, explanation: "A rectangular prism has 12 edges." },
      { question: "What is the result of reflecting the letter 'b' horizontally?", options: ["d", "p", "q", "b"], correctIndex: 0, explanation: "Reflecting 'b' horizontally (left-right mirror) gives 'd'." },
      { question: "A triangle has angles of 90° and 45°. What is the third angle?", options: ["30°", "45°", "60°", "90°"], correctIndex: 1, explanation: "Triangle angles sum to 180°. 180 - 90 - 45 = 45°." },
    ],
  },
  {
    id: "full-sim",
    title: "Full RCMP Simulation",
    description: "A comprehensive timed simulation covering all test areas.",
    questions: 15,
    time: 25,
    category: "Simulation",
    icon: FileText,
    testQuestions: [
      { question: "What is 30% of 250?", options: ["65", "75", "80", "70"], correctIndex: 1, explanation: "30% of 250 = 0.30 × 250 = 75." },
      { question: "Complete the series: 1, 4, 9, 16, __", options: ["20", "25", "32", "36"], correctIndex: 1, explanation: "These are perfect squares: 1², 2², 3², 4², 5² = 25." },
      { question: "'Diligent' is most similar to:", options: ["Lazy", "Hardworking", "Careless", "Indifferent"], correctIndex: 1, explanation: "Diligent means showing careful and persistent effort — hardworking." },
      { question: "A suspect is described as 5'10\", brown hair, wearing a grey hoodie. What color is the hoodie?", options: ["Black", "Blue", "Grey", "Brown"], correctIndex: 2, explanation: "The description states the suspect is wearing a grey hoodie." },
      { question: "How many faces does a triangular prism have?", options: ["3", "4", "5", "6"], correctIndex: 2, explanation: "A triangular prism has 5 faces: 2 triangles and 3 rectangles." },
      { question: "You witness a senior officer accepting a gift from a member of the public. What should you do?", options: ["Accept gifts too", "Ignore it", "Report through proper channels", "Confront the officer publicly"], correctIndex: 2, explanation: "Reporting through proper channels maintains integrity and follows protocol." },
      { question: "'Pen' is to 'Write' as 'Knife' is to:", options: ["Sharp", "Cut", "Kitchen", "Metal"], correctIndex: 1, explanation: "A pen is used to write; a knife is used to cut." },
      { question: "If all officers must file reports and John is an officer, then:", options: ["John may file reports", "John must file reports", "John filed a report yesterday", "John supervises reports"], correctIndex: 1, explanation: "If all officers must file reports and John is an officer, John must file reports." },
      { question: "A vehicle travels 240 km in 3 hours. What is the average speed?", options: ["60 km/h", "70 km/h", "80 km/h", "90 km/h"], correctIndex: 2, explanation: "Average speed = 240 ÷ 3 = 80 km/h." },
      { question: "What is the mirror image of the letter 'R'?", options: ["R", "Я", "P", "B"], correctIndex: 1, explanation: "The mirror image of R is a reversed R (Я)." },
      { question: "During a stressful situation, the most professional response is to:", options: ["React emotionally", "Freeze and wait", "Stay calm and follow procedures", "Delegate to someone else"], correctIndex: 2, explanation: "Maintaining composure and following established procedures is the professional standard." },
      { question: "What comes next: A1, B2, C3, D4, __", options: ["E5", "F5", "E6", "D5"], correctIndex: 0, explanation: "The pattern is consecutive letters paired with consecutive numbers: E5." },
      { question: "An incident report was filed at 22:15. What time is that in 12-hour format?", options: ["8:15 PM", "10:15 PM", "10:15 AM", "12:15 AM"], correctIndex: 1, explanation: "22:15 in 24-hour time = 10:15 PM." },
      { question: "Which is NOT a quality expected of law enforcement professionals?", options: ["Integrity", "Accountability", "Bias", "Teamwork"], correctIndex: 2, explanation: "Bias is not a desirable quality. Integrity, accountability, and teamwork are core competencies." },
      { question: "If a square has a perimeter of 36 cm, what is the length of one side?", options: ["6 cm", "9 cm", "12 cm", "18 cm"], correctIndex: 1, explanation: "Perimeter = 4 × side. Side = 36 ÷ 4 = 9 cm." },
    ],
  },
];

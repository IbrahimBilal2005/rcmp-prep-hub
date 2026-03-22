begin;

truncate table public.practice_test_questions restart identity cascade;
truncate table public.practice_tests restart identity cascade;
truncate table public.module_quiz_questions restart identity cascade;
truncate table public.lessons restart identity cascade;
truncate table public.modules restart identity cascade;

insert into public.modules (slug, title, description, sort_order, is_published)
values
  ('understanding-the-rcmp-aptitude-test', 'Understanding the RCMP Aptitude Test', 'Learn the test format, scoring methodology, and develop a strategic approach to maximize your results on test day.', 1, true),
  ('numerical-skills', 'Numerical Skills', 'Master arithmetic reasoning, data interpretation, and number series through structured practice and proven strategies.', 2, true),
  ('memory-observation', 'Memory & Observation', 'Develop powerful techniques to recall details from images, text passages, and complex scenarios under time pressure.', 3, true),
  ('spatial-reasoning', 'Spatial Reasoning', 'Practice pattern recognition, shape rotation, mirror images, and visual-spatial problem solving.', 4, true),
  ('language-logical-reasoning', 'Language & Logical Reasoning', 'Strengthen verbal comprehension, analogies, syllogisms, and logical deduction skills.', 5, true),
  ('full-practice-tests', 'Full Practice Tests', 'Take timed, full-length RCMP simulation exams with detailed score breakdowns and answer explanations.', 6, true),
  ('work-style-professional-judgment', 'Work Style & Professional Judgment', 'Prepare for behavioral and situational assessment questions with real-world law enforcement scenarios.', 7, true);

insert into public.lessons (module_id, title, chapter_label, summary, duration_minutes, sort_order, video_path, poster_path, is_preview, is_published)
values
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'Test Overview & Format', 'Lesson 01', 'Walk through the exam structure, section order, and what each part is designed to measure.', 12, 1, null, null, true, true),
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'Scoring Methodology', 'Lesson 02', 'Understand how performance is evaluated and where candidates most often give points away.', 10, 2, null, null, true, true),
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'Time Management Strategies', 'Lesson 03', 'Learn pacing rules that protect easy marks and keep you moving under pressure.', 15, 3, null, null, false, true),
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'Test Day Preparation', 'Lesson 04', 'Review the routines, expectations, and setup details that help you stay composed on exam day.', 8, 4, null, null, false, true),

  ((select id from public.modules where slug = 'numerical-skills'), 'Basic Arithmetic Review', 'Lesson 01', 'Refresh the arithmetic rules and mental-math habits used throughout the numerical section.', 15, 1, null, null, true, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Fractions & Percentages', 'Lesson 02', 'Work through percentage, ratio, and fraction conversions with quick comparison methods.', 18, 2, null, null, true, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Number Series Patterns', 'Lesson 03', 'Identify common progression rules faster by spotting multiplication, subtraction, and alternating structures.', 20, 3, null, null, false, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Data Interpretation', 'Lesson 04', 'Read tables, charts, and simple data sets without losing time to unnecessary recalculation.', 15, 4, null, null, false, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Word Problems', 'Lesson 05', 'Translate written scenarios into clean equations and isolate the number that actually matters.', 18, 5, null, null, false, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Speed & Accuracy Tips', 'Lesson 06', 'Use repeatable shortcuts to stay efficient without introducing avoidable mistakes.', 12, 6, null, null, false, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Practice Set A', 'Lesson 07', 'Apply the module techniques in a guided mixed set that emphasizes method over speed.', 20, 7, null, null, false, true),
  ((select id from public.modules where slug = 'numerical-skills'), 'Practice Set B', 'Lesson 08', 'Run a second numerical set with tighter pacing and more exam-style question switching.', 20, 8, null, null, false, true),

  ((select id from public.modules where slug = 'memory-observation'), 'Memory Techniques Overview', 'Lesson 01', 'Compare the core recall methods that help candidates organize details instead of memorizing randomly.', 12, 1, null, null, true, true),
  ((select id from public.modules where slug = 'memory-observation'), 'Visual Memory Training', 'Lesson 02', 'Train your eye to scan visual scenes in a consistent order before key details disappear.', 18, 2, null, null, false, true),
  ((select id from public.modules where slug = 'memory-observation'), 'Text Recall Strategies', 'Lesson 03', 'Use chunking and keyword anchors to retain written details from short passages and reports.', 15, 3, null, null, false, true),
  ((select id from public.modules where slug = 'memory-observation'), 'Observation Exercises', 'Lesson 04', 'Practice structured observation so your first pass captures layout, people, and distinguishing features.', 20, 4, null, null, false, true),
  ((select id from public.modules where slug = 'memory-observation'), 'Practice Scenarios', 'Lesson 05', 'Work through applied memory scenarios that combine visual and written information under light pressure.', 20, 5, null, null, false, true),
  ((select id from public.modules where slug = 'memory-observation'), 'Timed Memory Challenge', 'Lesson 06', 'Test your retention speed with a fast-paced drill that rewards disciplined recall habits.', 15, 6, null, null, false, true),

  ((select id from public.modules where slug = 'spatial-reasoning'), 'Introduction to Spatial Reasoning', 'Lesson 01', 'Learn the visual rules behind rotation, reflection, and transformation-style test questions.', 10, 1, null, null, true, true),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'Pattern Recognition', 'Lesson 02', 'Spot recurring visual relationships before getting distracted by decorative details.', 18, 2, null, null, false, true),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'Shape Rotation & Folding', 'Lesson 03', 'Break rotation and fold questions into simple directional checks that reduce guesswork.', 20, 3, null, null, false, true),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'Mirror Images', 'Lesson 04', 'Practice reflection problems by tracking edges, orientation, and reversal cues in sequence.', 15, 4, null, null, false, true),
  ((select id from public.modules where slug = 'spatial-reasoning'), '2D to 3D Visualization', 'Lesson 05', 'Move from flat diagrams to object reasoning without losing track of hidden faces and edges.', 18, 5, null, null, false, true),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'Practice Set A', 'Lesson 06', 'Work through guided spatial drills using the module''s step-by-step visual method.', 15, 6, null, null, false, true),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'Practice Set B', 'Lesson 07', 'Run a second mixed set that pushes faster recognition across several spatial question types.', 15, 7, null, null, false, true),

  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Verbal Comprehension', 'Lesson 01', 'Sharpen close-reading habits so you answer what the prompt actually asks, not what it suggests.', 15, 1, null, null, true, true),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Analogies & Relationships', 'Lesson 02', 'Recognize word relationships quickly and avoid surface-level matches that break the pattern.', 18, 2, null, null, false, true),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Logical Deduction', 'Lesson 03', 'Use premise-based reasoning to eliminate choices that sound plausible but are not supported.', 20, 3, null, null, false, true),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Syllogisms', 'Lesson 04', 'Translate formal logic statements into simple structures you can test against each answer.', 15, 4, null, null, false, true),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Critical Reasoning', 'Lesson 05', 'Identify assumptions, weak arguments, and missing links in short reasoning prompts.', 18, 5, null, null, false, true),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Practice Exercises', 'Lesson 06', 'Apply the language and logic techniques across a mixed set of RCMP-style verbal questions.', 20, 6, null, null, false, true),

  ((select id from public.modules where slug = 'full-practice-tests'), 'Practice Exam 1', 'Lesson 01', 'Run an early mixed exam to establish your baseline and see which sections break your rhythm first.', 45, 1, null, null, false, true),
  ((select id from public.modules where slug = 'full-practice-tests'), 'Practice Exam 2', 'Lesson 02', 'Build on the first simulation with another timed set focused on consistency across question types.', 45, 2, null, null, false, true),
  ((select id from public.modules where slug = 'full-practice-tests'), 'Practice Exam 3', 'Lesson 03', 'Use a third full run to tighten pacing and expose recurring weak spots before longer simulations.', 45, 3, null, null, false, true),
  ((select id from public.modules where slug = 'full-practice-tests'), 'Full Simulation A', 'Lesson 04', 'Take a longer exam-style session that mirrors the pressure and concentration demands of the real test.', 60, 4, null, null, false, true),
  ((select id from public.modules where slug = 'full-practice-tests'), 'Full Simulation B', 'Lesson 05', 'Complete a second long simulation to compare improvement, pacing, and decision quality under fatigue.', 60, 5, null, null, false, true),

  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'Integrity & Accountability', 'Lesson 01', 'Review the judgment standards expected when professionalism and ethics are put under pressure.', 12, 1, null, null, true, true),
  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'Professional Responsibility', 'Lesson 02', 'Work through responsibility-based scenarios where procedure and discretion need to stay balanced.', 15, 2, null, null, false, true),
  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'Teamwork & Cooperation', 'Lesson 03', 'See how collaboration, communication, and role clarity affect workplace decision-making questions.', 12, 3, null, null, false, true),
  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'Handling Pressure & Stress', 'Lesson 04', 'Practice choosing calm, procedural responses when a situation becomes tense or emotionally charged.', 15, 4, null, null, false, true),
  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'Situational Practice Questions', 'Lesson 05', 'Apply the module principles across realistic judgment prompts built around law-enforcement contexts.', 20, 5, null, null, false, true);

insert into public.module_quiz_questions (module_id, question, options, correct_index, explanation, sort_order)
values
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'How many sections does the RCMP aptitude test typically contain?', '["3","5","7","10"]'::jsonb, 1, 'The RCMP aptitude test typically contains 5 main sections covering different cognitive abilities.', 1),
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'What is the best strategy when you encounter a difficult question?', '["Spend extra time on it","Skip it and return later","Guess randomly","Leave it blank"]'::jsonb, 1, 'Skipping difficult questions and returning later ensures you answer all easier questions first, maximizing your score.', 2),
  ((select id from public.modules where slug = 'understanding-the-rcmp-aptitude-test'), 'Which of the following is NOT typically assessed in the RCMP aptitude test?', '["Numerical reasoning","Physical fitness","Memory recall","Spatial reasoning"]'::jsonb, 1, 'Physical fitness is assessed separately. The aptitude test focuses on cognitive abilities.', 3),

  ((select id from public.modules where slug = 'numerical-skills'), 'What is 15% of 240?', '["30","36","42","48"]'::jsonb, 1, '15% of 240 = 0.15 x 240 = 36.', 1),
  ((select id from public.modules where slug = 'numerical-skills'), 'Complete the series: 2, 6, 18, 54, __', '["108","162","72","216"]'::jsonb, 1, 'Each number is multiplied by 3. 54 x 3 = 162.', 2),
  ((select id from public.modules where slug = 'numerical-skills'), 'A car travels 180 km in 2.5 hours. What is its average speed?', '["60 km/h","72 km/h","80 km/h","90 km/h"]'::jsonb, 1, 'Average speed = 180 / 2.5 = 72 km/h.', 3),
  ((select id from public.modules where slug = 'numerical-skills'), 'If 3x + 7 = 22, what is x?', '["3","5","7","15"]'::jsonb, 1, '3x = 22 - 7 = 15, so x = 15 / 3 = 5.', 4),

  ((select id from public.modules where slug = 'memory-observation'), 'Which memory technique involves creating a mental journey through familiar locations?', '["Chunking","Method of Loci","Spaced Repetition","Mnemonics"]'::jsonb, 1, 'The Method of Loci (Memory Palace) involves placing items to remember along a familiar route.', 1),
  ((select id from public.modules where slug = 'memory-observation'), 'What is ''chunking'' in the context of memory?', '["Breaking info into smaller groups","Memorizing one item at a time","Forgetting irrelevant details","Speed reading"]'::jsonb, 0, 'Chunking involves grouping individual pieces of information into larger, meaningful units.', 2),
  ((select id from public.modules where slug = 'memory-observation'), 'When observing a scene, what should you focus on first?', '["Colors only","People''s faces","Overall layout then specific details","Random elements"]'::jsonb, 2, 'Start with the big picture (overall layout) then systematically note specific details.', 3),

  ((select id from public.modules where slug = 'spatial-reasoning'), 'When a shape is rotated 180 degrees, which property always stays the same?', '["Position","Orientation","Size and shape","Color only"]'::jsonb, 2, 'Rotation preserves size and shape. Only position and orientation change.', 1),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'A mirror image is also called a:', '["Translation","Rotation","Reflection","Dilation"]'::jsonb, 2, 'A mirror image is a reflection - flipping the shape across an axis.', 2),
  ((select id from public.modules where slug = 'spatial-reasoning'), 'How many faces does a cube have?', '["4","6","8","12"]'::jsonb, 1, 'A cube has 6 faces, 12 edges, and 8 vertices.', 3),

  ((select id from public.modules where slug = 'language-logical-reasoning'), '''Hot'' is to ''Cold'' as ''Up'' is to:', '["Left","Down","High","Over"]'::jsonb, 1, 'Hot and Cold are antonyms, so the antonym of Up is Down.', 1),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'All dogs are animals. Some animals are pets. Therefore:', '["All dogs are pets","Some dogs are pets","No valid conclusion","All pets are dogs"]'::jsonb, 2, 'We cannot conclude that dogs are pets from these premises - it is a logical fallacy.', 2),
  ((select id from public.modules where slug = 'language-logical-reasoning'), 'Which word does NOT belong: Apple, Banana, Carrot, Grape?', '["Apple","Banana","Carrot","Grape"]'::jsonb, 2, 'Carrot is a vegetable; the others are all fruits.', 3),

  ((select id from public.modules where slug = 'full-practice-tests'), 'What is the recommended approach for a timed test?', '["Answer in order no matter what","Read all questions first then answer","Answer easy ones first, return to hard ones","Spend equal time on every question"]'::jsonb, 2, 'Answering easy questions first builds confidence and ensures you do not miss points on questions you know.', 1),
  ((select id from public.modules where slug = 'full-practice-tests'), 'If you finish a section early, what should you do?', '["Submit immediately","Review your answers","Start daydreaming","Skip to next section"]'::jsonb, 1, 'Always review your answers if time permits - you may catch errors or remember answers to skipped questions.', 2),

  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'You notice a colleague taking office supplies home without permission. What would you most likely do?', '["Ignore it","Confront them aggressively","Report the behavior through proper channels","Join them"]'::jsonb, 2, 'Law enforcement roles emphasize integrity and accountability. Reporting through proper channels is the professional response.', 1),
  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'A member of the public is being verbally aggressive toward you during a routine interaction. What is the best response?', '["Respond with equal aggression","Walk away without explanation","Remain calm and professional while de-escalating","Threaten to arrest them"]'::jsonb, 2, 'De-escalation and maintaining professionalism are key competencies in law enforcement.', 2),
  ((select id from public.modules where slug = 'work-style-professional-judgment'), 'You discover a minor error in a report filed by a senior officer. What should you do?', '["Ignore it to avoid conflict","Correct it yourself without telling anyone","Bring it to the officer''s attention respectfully","Report them to internal affairs"]'::jsonb, 2, 'Respectfully bringing errors to attention shows integrity while maintaining professional relationships.', 3);

insert into public.practice_tests (slug, title, description, category, time_limit_minutes, sort_order, is_preview, is_published)
values
  ('numerical', 'Numerical Reasoning', 'Test your arithmetic, data interpretation, and number series skills.', 'Numerical', 15, 1, true, true),
  ('memory', 'Memory & Observation', 'Test your ability to recall details accurately and observe patterns under pressure.', 'Memory', 12, 2, true, true),
  ('language', 'Language Reasoning', 'Test verbal comprehension, analogies, and logical deduction.', 'Language', 15, 3, false, true),
  ('spatial', 'Spatial Reasoning', 'Test pattern recognition, rotation, and visual-spatial skills.', 'Spatial', 12, 4, false, true),
  ('full-sim', 'Full RCMP Simulation', 'A comprehensive timed simulation covering all test areas.', 'Simulation', 25, 5, false, true);

insert into public.practice_test_questions (practice_test_id, question, options, correct_index, explanation, sort_order)
values
  ((select id from public.practice_tests where slug = 'numerical'), 'What is 25% of 360?', '["80","90","100","72"]'::jsonb, 1, '25% of 360 = 0.25 x 360 = 90.', 1),
  ((select id from public.practice_tests where slug = 'numerical'), 'Complete the series: 3, 9, 27, 81, __', '["162","243","108","324"]'::jsonb, 1, 'Each number is multiplied by 3. 81 x 3 = 243.', 2),
  ((select id from public.practice_tests where slug = 'numerical'), 'If a store offers a 20% discount on a $75 item, what is the sale price?', '["$55","$60","$65","$50"]'::jsonb, 1, '20% of $75 = $15. Sale price = $75 - $15 = $60.', 3),
  ((select id from public.practice_tests where slug = 'numerical'), 'What is 144 / 12?', '["11","12","13","14"]'::jsonb, 1, '144 / 12 = 12.', 4),
  ((select id from public.practice_tests where slug = 'numerical'), 'A train travels at 90 km/h. How far does it travel in 40 minutes?', '["50 km","60 km","45 km","70 km"]'::jsonb, 1, '40 minutes = 2/3 hour. Distance = 90 x 2/3 = 60 km.', 5),
  ((select id from public.practice_tests where slug = 'numerical'), 'What is the next prime number after 13?', '["14","15","17","19"]'::jsonb, 2, '14 is divisible by 2, 15 by 3, 16 by 2. 17 is the next prime after 13.', 6),
  ((select id from public.practice_tests where slug = 'numerical'), 'If 5 workers can complete a job in 8 days, how many days will 10 workers take?', '["4 days","16 days","2 days","6 days"]'::jsonb, 0, 'Double the workers = half the time. 8 / 2 = 4 days.', 7),
  ((select id from public.practice_tests where slug = 'numerical'), 'What is 3^2 + 4^2?', '["24","25","7","49"]'::jsonb, 1, '3^2 + 4^2 = 9 + 16 = 25.', 8),
  ((select id from public.practice_tests where slug = 'numerical'), 'A recipe calls for 2 cups of flour for 12 cookies. How many cups for 30 cookies?', '["4","5","6","3"]'::jsonb, 1, '30/12 x 2 = 2.5 x 2 = 5 cups.', 9),
  ((select id from public.practice_tests where slug = 'numerical'), 'What is the average of 15, 20, 25, and 40?', '["20","25","30","35"]'::jsonb, 1, 'Sum = 100. Average = 100 / 4 = 25.', 10),

  ((select id from public.practice_tests where slug = 'memory'), 'A witness describes a suspect wearing a blue jacket, black jeans, and white sneakers. Which detail was mentioned?', '["Red hat","Blue jacket","Brown boots","Green shirt"]'::jsonb, 1, 'The witness specifically mentioned a blue jacket.', 1),
  ((select id from public.practice_tests where slug = 'memory'), 'In a sequence of events: John arrived at 3pm, Mary at 3:15pm, Tom at 2:45pm. Who arrived first?', '["John","Mary","Tom","They arrived simultaneously"]'::jsonb, 2, 'Tom arrived at 2:45pm, which is the earliest time.', 2),
  ((select id from public.practice_tests where slug = 'memory'), 'A vehicle plate reads ''ABC 1234''. What is the third letter?', '["A","B","C","D"]'::jsonb, 2, 'The third letter in ABC is C.', 3),
  ((select id from public.practice_tests where slug = 'memory'), 'You observe 5 people in a room: 2 are sitting, 1 is standing by the window, and 2 are at the door. How many are NOT sitting?', '["2","3","4","5"]'::jsonb, 1, '5 total - 2 sitting = 3 not sitting.', 4),
  ((select id from public.practice_tests where slug = 'memory'), 'A report mentions the incident occurred on ''Tuesday, March 15th at 14:30''. What day was it?', '["Monday","Tuesday","Wednesday","Thursday"]'::jsonb, 1, 'The report clearly states Tuesday.', 5),
  ((select id from public.practice_tests where slug = 'memory'), 'In a lineup of 6 people, the tallest is in position 3 and the shortest in position 6. Which position has the tallest?', '["1","3","5","6"]'::jsonb, 1, 'The tallest person is in position 3 as stated.', 6),
  ((select id from public.practice_tests where slug = 'memory'), 'A street address is 4872 Oak Avenue. What are the last two digits of the number?', '["48","72","87","42"]'::jsonb, 1, 'The last two digits of 4872 are 72.', 7),
  ((select id from public.practice_tests where slug = 'memory'), 'Three cars are parked: a red sedan, a blue SUV, and a white truck. Which vehicle is an SUV?', '["Red","Blue","White","None"]'::jsonb, 1, 'The blue vehicle is described as an SUV.', 8),

  ((select id from public.practice_tests where slug = 'language'), '''Brave'' is most similar in meaning to:', '["Scared","Courageous","Cautious","Reckless"]'::jsonb, 1, 'Courageous is the closest synonym to brave.', 1),
  ((select id from public.practice_tests where slug = 'language'), '''Book'' is to ''Library'' as ''Painting'' is to:', '["Artist","Museum","Canvas","Brush"]'::jsonb, 1, 'Books are found in libraries; paintings are found in museums.', 2),
  ((select id from public.practice_tests where slug = 'language'), 'Which word is the opposite of ''transparent''?', '["Clear","Opaque","Visible","Bright"]'::jsonb, 1, 'Opaque means not transparent - light cannot pass through.', 3),
  ((select id from public.practice_tests where slug = 'language'), 'All roses are flowers. All flowers need water. Therefore:', '["All water needs roses","All roses need water","Some flowers are roses","Water is a rose"]'::jsonb, 1, 'If all roses are flowers and all flowers need water, then all roses need water.', 4),
  ((select id from public.practice_tests where slug = 'language'), 'Choose the word that does NOT belong: Swift, Quick, Rapid, Heavy', '["Swift","Quick","Rapid","Heavy"]'::jsonb, 3, 'Heavy relates to weight; the others all mean fast.', 5),
  ((select id from public.practice_tests where slug = 'language'), 'If APPLE is coded as BQQMF, what is BEAR coded as?', '["CFBS","CDBS","CFAS","CABS"]'::jsonb, 0, 'Each letter shifts forward by 1: B to C, E to F, A to B, R to S = CFBS.', 6),
  ((select id from public.practice_tests where slug = 'language'), '''Nocturnal'' most likely describes an animal that:', '["Lives in water","Is active at night","Eats plants","Migrates south"]'::jsonb, 1, 'Nocturnal means active during the night.', 7),
  ((select id from public.practice_tests where slug = 'language'), 'Which sentence is grammatically correct?', '["Him and me went.","He and I went.","Me and him went.","I and he went."]'::jsonb, 1, '''He and I'' is the correct subject pronoun usage.', 8),
  ((select id from public.practice_tests where slug = 'language'), '''Benevolent'' most closely means:', '["Harmful","Kind and generous","Indifferent","Strict"]'::jsonb, 1, 'Benevolent means well-meaning and kindly; generous.', 9),
  ((select id from public.practice_tests where slug = 'language'), 'If no cats are dogs, and some pets are cats, which is true?', '["No pets are dogs","Some pets are not dogs","All cats are pets","All dogs are pets"]'::jsonb, 1, 'Since some pets are cats, and no cats are dogs, those pet-cats are not dogs - so some pets are not dogs.', 10),

  ((select id from public.practice_tests where slug = 'spatial'), 'If you rotate the letter ''N'' 180 degrees, what does it look like?', '["N","Z","N (same)","U"]'::jsonb, 2, 'The letter N rotated 180 degrees looks like the same letter N.', 1),
  ((select id from public.practice_tests where slug = 'spatial'), 'How many sides does a hexagon have?', '["5","6","7","8"]'::jsonb, 1, 'A hexagon has 6 sides.', 2),
  ((select id from public.practice_tests where slug = 'spatial'), 'A square piece of paper is folded in half, then in half again. How many layers are there?', '["2","3","4","8"]'::jsonb, 2, 'First fold: 2 layers. Second fold: 4 layers.', 3),
  ((select id from public.practice_tests where slug = 'spatial'), 'Which shape has all sides equal and all angles equal to 60 degrees?', '["Square","Equilateral triangle","Pentagon","Rhombus"]'::jsonb, 1, 'An equilateral triangle has all sides equal and all angles equal to 60 degrees.', 4),
  ((select id from public.practice_tests where slug = 'spatial'), 'If you look at a clock in a mirror showing 3:00, what time does the mirror show?', '["3:00","9:00","6:00","12:00"]'::jsonb, 1, 'A mirror reflection of 3:00 appears as 9:00.', 5),
  ((select id from public.practice_tests where slug = 'spatial'), 'How many edges does a rectangular prism (box) have?', '["8","10","12","14"]'::jsonb, 2, 'A rectangular prism has 12 edges.', 6),
  ((select id from public.practice_tests where slug = 'spatial'), 'What is the result of reflecting the letter ''b'' horizontally?', '["d","p","q","b"]'::jsonb, 0, 'Reflecting b horizontally gives d.', 7),
  ((select id from public.practice_tests where slug = 'spatial'), 'A triangle has angles of 90 degrees and 45 degrees. What is the third angle?', '["30 degrees","45 degrees","60 degrees","90 degrees"]'::jsonb, 1, 'Triangle angles sum to 180. 180 - 90 - 45 = 45.', 8),

  ((select id from public.practice_tests where slug = 'full-sim'), 'What is 30% of 250?', '["65","75","80","70"]'::jsonb, 1, '30% of 250 = 0.30 x 250 = 75.', 1),
  ((select id from public.practice_tests where slug = 'full-sim'), 'Complete the series: 1, 4, 9, 16, __', '["20","25","32","36"]'::jsonb, 1, 'These are perfect squares: 1^2, 2^2, 3^2, 4^2, 5^2 = 25.', 2),
  ((select id from public.practice_tests where slug = 'full-sim'), '''Diligent'' is most similar to:', '["Lazy","Hardworking","Careless","Indifferent"]'::jsonb, 1, 'Diligent means showing careful and persistent effort - hardworking.', 3),
  ((select id from public.practice_tests where slug = 'full-sim'), 'A suspect is described as 5''10", brown hair, wearing a grey hoodie. What color is the hoodie?', '["Black","Blue","Grey","Brown"]'::jsonb, 2, 'The description states the suspect is wearing a grey hoodie.', 4),
  ((select id from public.practice_tests where slug = 'full-sim'), 'How many faces does a triangular prism have?', '["3","4","5","6"]'::jsonb, 2, 'A triangular prism has 5 faces: 2 triangles and 3 rectangles.', 5),
  ((select id from public.practice_tests where slug = 'full-sim'), 'You witness a senior officer accepting a gift from a member of the public. What should you do?', '["Accept gifts too","Ignore it","Report through proper channels","Confront the officer publicly"]'::jsonb, 2, 'Reporting through proper channels maintains integrity and follows protocol.', 6),
  ((select id from public.practice_tests where slug = 'full-sim'), '''Pen'' is to ''Write'' as ''Knife'' is to:', '["Sharp","Cut","Kitchen","Metal"]'::jsonb, 1, 'A pen is used to write; a knife is used to cut.', 7),
  ((select id from public.practice_tests where slug = 'full-sim'), 'If all officers must file reports and John is an officer, then:', '["John may file reports","John must file reports","John filed a report yesterday","John supervises reports"]'::jsonb, 1, 'If all officers must file reports and John is an officer, John must file reports.', 8),
  ((select id from public.practice_tests where slug = 'full-sim'), 'A vehicle travels 240 km in 3 hours. What is the average speed?', '["60 km/h","70 km/h","80 km/h","90 km/h"]'::jsonb, 2, 'Average speed = 240 / 3 = 80 km/h.', 9),
  ((select id from public.practice_tests where slug = 'full-sim'), 'What is the mirror image of the letter ''R''?', '["R","reversed R","P","B"]'::jsonb, 1, 'The mirror image of R is a reversed R.', 10),
  ((select id from public.practice_tests where slug = 'full-sim'), 'During a stressful situation, the most professional response is to:', '["React emotionally","Freeze and wait","Stay calm and follow procedures","Delegate to someone else"]'::jsonb, 2, 'Maintaining composure and following established procedures is the professional standard.', 11),
  ((select id from public.practice_tests where slug = 'full-sim'), 'What comes next: A1, B2, C3, D4, __', '["E5","F5","E6","D5"]'::jsonb, 0, 'The pattern is consecutive letters paired with consecutive numbers: E5.', 12),
  ((select id from public.practice_tests where slug = 'full-sim'), 'An incident report was filed at 22:15. What time is that in 12-hour format?', '["8:15 PM","10:15 PM","10:15 AM","12:15 AM"]'::jsonb, 1, '22:15 in 24-hour time = 10:15 PM.', 13),
  ((select id from public.practice_tests where slug = 'full-sim'), 'Which is NOT a quality expected of law enforcement professionals?', '["Integrity","Accountability","Bias","Teamwork"]'::jsonb, 2, 'Bias is not a desirable quality. Integrity, accountability, and teamwork are core competencies.', 14),
  ((select id from public.practice_tests where slug = 'full-sim'), 'If a square has a perimeter of 36 cm, what is the length of one side?', '["6 cm","9 cm","12 cm","18 cm"]'::jsonb, 1, 'Perimeter = 4 x side. Side = 36 / 4 = 9 cm.', 15);

commit;

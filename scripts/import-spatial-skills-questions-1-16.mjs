import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ZIP_PATH = path.join(ROOT, "spatialskillsquestion116.zip");
const EXTRACT_DIR = path.join(ROOT, "tmp", "spatial-skills-question-1-16");
const BUCKET = "question-images";

const APPLY = process.argv.includes("--apply");
const REPLACE = process.argv.includes("--replace");
const TARGET = getArgValue("--target") || "practice-test";
const PRACTICE_TEST_SLUG = getArgValue("--test-slug") || "spatial-skills-practice";
const MODULE_SLUG = getArgValue("--module-slug") || "spatial-skills";

function getArgValue(name) {
  const prefixed = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefixed));
  return match ? match.slice(prefixed.length) : null;
}

const questions = [
  {
    number: 1,
    question: "Which option shows the same shape rotated, not flipped?",
    correctIndexes: [0],
    explanation:
      "A rotation keeps the orientation (handedness) the same.\nA mirror flip reverses it. Option A preserves the structure without reversing it.",
  },
  {
    number: 2,
    question: "Which option shows the reference shape rotated 180 degrees?",
    correctIndexes: [0],
    explanation:
      "A 180 degree rotation flips the shape upside down while keeping all connections identical.\nThe marked point moves from top to bottom but stays attached to the same vertex.",
  },
  {
    number: 3,
    question: "Which option is the same shape rotated 90 degrees clockwise?",
    correctIndexes: [1],
    explanation:
      "A = wrong direction (counterclockwise / mirror-like)\nB = exact 90 degree clockwise rotation\nC = 180 degree rotation\nD = extra element added (invalid)",
  },
  {
    number: 4,
    question: "Which option shows the same arrow rotated 180 degrees?",
    correctIndexes: [1],
    explanation:
      "A 180 degree rotation reverses direction.\nRight-facing arrow becomes a left-facing arrow.",
  },
  {
    number: 5,
    question: "Which option matches after rotation?",
    correctIndexes: [0],
    explanation:
      "Rotation moves positions but does not reverse them.\nMirroring flips the black/white placement. Only A preserves orientation.",
  },
  {
    number: 6,
    question: "Which option is the same shape rotated 90 degrees?",
    correctIndexes: [0],
    explanation:
      "Rotation keeps structure identical, only changing direction.\nOnly A maintains the exact proportions and angles.",
  },
  {
    number: 7,
    question: "Which option matches after a 90 degree clockwise rotation?",
    correctIndexes: [0],
    explanation:
      "All internal parts rotate together.\nOnly A correctly moves every element consistently.",
  },
  {
    number: 8,
    question: "Which option is a rotation, not a mirror?",
    correctIndexes: [0],
    explanation:
      "Rotation preserves handedness.\nMirroring reverses handedness.\nOnly A keeps the original orientation.",
  },
  {
    number: 9,
    question: "Which option is a mirror image, not a rotation?",
    correctIndexes: [1],
    explanation:
      "A mirror flips left and right.\nThis reversal cannot be achieved by rotation alone.",
  },
  {
    number: 10,
    question: "Which option cannot be produced by rotating the reference shape?",
    correctIndexes: [2],
    explanation:
      "Option C requires bending, reshaping, or flipping.\nRotations cannot distort or curve shapes.",
  },
  {
    number: 11,
    question: "A shape rotated twice by 90 degrees results in:",
    correctIndexes: [2],
    explanation: "90 degrees plus 90 degrees equals a 180 degree rotation.",
  },
  {
    number: 12,
    question: "Which option is achieved only by rotation and not by mirroring?",
    correctIndexes: [2],
    explanation:
      "Mirroring reverses orientation.\nOnly C maintains correct handedness and is achievable purely by rotation.",
  },
  {
    number: 13,
    question: "Which option shows the same shape viewed from the back?",
    correctIndexes: [1],
    explanation:
      "Viewing from the back is equivalent to a horizontal flip.\nOnly B matches that reversed perspective correctly.",
  },
  {
    number: 14,
    question: "Which operation changes handedness (chirality)?",
    correctIndexes: [2],
    explanation:
      "Only reflection (mirror) changes handedness.\nRotations preserve it.",
  },
  {
    number: 15,
    question: "If the cube is rotated 90 degrees forward, where is the dot?",
    correctIndexes: [0],
    explanation:
      "The top face moves toward the viewer and the front face becomes the bottom.\nThe dot moves accordingly to the new visible face, which matches A.",
  },
  {
    number: 16,
    question: "If the cube is rotated 90 degrees to the right, where is the shaded face?",
    correctIndexes: [2],
    explanation:
      "A right rotation moves faces in this sequence: front to right, right to back, back to left.\nThe shaded face shifts correctly only in C.",
  },
];

const optionLabels = ["A", "B", "C", "D"];

const loadEnv = () => {
  const envPath = path.join(ROOT, ".env");
  const env = { ...process.env };

  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
    }
  }

  return env;
};

const sanitizeFileName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractZip = () => {
  if (!fs.existsSync(ZIP_PATH)) {
    throw new Error(`Missing zip: ${ZIP_PATH}`);
  }

  fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
  fs.mkdirSync(EXTRACT_DIR, { recursive: true });
  execFileSync("powershell", [
    "-NoProfile",
    "-Command",
    `Expand-Archive -LiteralPath ${JSON.stringify(ZIP_PATH)} -DestinationPath ${JSON.stringify(EXTRACT_DIR)} -Force`,
  ], { stdio: "inherit" });
};

const findImageForQuestion = (questionNumber) => {
  const files = fs.readdirSync(EXTRACT_DIR, { recursive: true })
    .map((file) => path.join(EXTRACT_DIR, file.toString()))
    .filter((file) => fs.statSync(file).isFile());

  const pattern = new RegExp(`question\\s*${questionNumber}(?!\\d)`, "i");
  const image = files.find((file) => pattern.test(path.basename(file)));

  if (!image) {
    throw new Error(`Could not find image for question ${questionNumber}`);
  }

  return image;
};

const getSupabase = async (env) => {
  const url = env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

  if (!url) throw new Error("Missing VITE_SUPABASE_URL in .env");

  if (serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const email = env.SUPABASE_ADMIN_EMAIL;
  const password = env.SUPABASE_ADMIN_PASSWORD;

  if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env");

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (email && password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Admin login failed: ${error.message}`);
    return client;
  }

  if (APPLY) {
    throw new Error(
      "Live import needs SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD in .env. The anon key alone cannot upload/insert admin content.",
    );
  }

  return client;
};

const getTarget = async (supabase) => {
  if (TARGET === "practice-test") {
    const { data, error } = await supabase
      .from("practice_tests")
      .select("id, slug, title")
      .eq("slug", PRACTICE_TEST_SLUG)
      .maybeSingle();

    if (error) throw new Error(`Unable to load practice test '${PRACTICE_TEST_SLUG}': ${error.message}`);
    if (!data) throw new Error(`Practice test not found: ${PRACTICE_TEST_SLUG}`);

    return {
      id: data.id,
      label: `practice test '${data.title}'`,
      table: "practice_test_questions",
      foreignKey: "practice_test_id",
      ownerType: "test",
    };
  }

  if (TARGET === "module") {
    const { data, error } = await supabase
      .from("modules")
      .select("id, slug, title")
      .eq("slug", MODULE_SLUG)
      .maybeSingle();

    if (error) throw new Error(`Unable to load module '${MODULE_SLUG}': ${error.message}`);
    if (!data) throw new Error(`Module not found: ${MODULE_SLUG}`);

    return {
      id: data.id,
      label: `module '${data.title}'`,
      table: "module_quiz_questions",
      foreignKey: "module_id",
      ownerType: "module",
    };
  }

  throw new Error("Invalid --target. Use --target=practice-test or --target=module.");
};

const getNextSortOrder = async (supabase, target) => {
  if (REPLACE) return 1;

  const { data, error } = await supabase
    .from(target.table)
    .select("sort_order")
    .eq(target.foreignKey, target.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Unable to load next sort order: ${error.message}`);
  return (data?.sort_order ?? 0) + 1;
};

const uploadImage = async (supabase, target, questionId, questionNumber, imagePath) => {
  const ext = path.extname(imagePath).toLowerCase() || ".jpeg";
  const fileName = sanitizeFileName(`spatial-skills-question-${questionNumber}${ext}`);
  const storagePath = `${target.ownerType}-${target.id}/question-${questionId}/prompt/${Date.now()}-${fileName}`;
  const bytes = fs.readFileSync(imagePath);
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(`Upload failed for question ${questionNumber}: ${error.message}`);
  return storagePath;
};

const removeExistingRows = async (supabase, target) => {
  const { data, error } = await supabase
    .from(target.table)
    .select("id, question_image_path")
    .eq(target.foreignKey, target.id);

  if (error) throw new Error(`Unable to load existing questions: ${error.message}`);

  const imagePaths = (data ?? [])
    .map((row) => row.question_image_path)
    .filter((value) => typeof value === "string" && value.trim());

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(imagePaths);
    if (storageError) {
      console.warn(`Storage cleanup warning: ${storageError.message}`);
    }
  }

  const { error: deleteError } = await supabase
    .from(target.table)
    .delete()
    .eq(target.foreignKey, target.id);

  if (deleteError) throw new Error(`Unable to delete existing questions: ${deleteError.message}`);
};

const main = async () => {
  extractZip();
  const env = loadEnv();
  const supabase = await getSupabase(env);
  const target = await getTarget(supabase);
  const startSortOrder = await getNextSortOrder(supabase, target);

  const payloads = questions.map((entry, index) => ({
    ...entry,
    sortOrder: startSortOrder + index,
    imagePath: findImageForQuestion(entry.number),
    options: optionLabels.map((label) => ({ text: label, image_path: null })),
    correctIndex: entry.correctIndexes[0] ?? null,
  }));

  console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
  console.log(`Target: ${target.label}`);
  console.log(`Action: ${REPLACE ? "replace all existing questions" : `append starting at sort_order ${startSortOrder}`}`);
  console.table(payloads.map((item) => ({
    sort_order: item.sortOrder,
    question: item.number,
    correct: item.correctIndexes.map((index) => optionLabels[index]).join(", "),
    image: path.basename(item.imagePath),
  })));

  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply. Add --replace to replace existing questions for the target.");
    return;
  }

  if (REPLACE) {
    await removeExistingRows(supabase, target);
  }

  const inserted = [];
  const uploadedPaths = [];

  try {
    for (const payload of payloads) {
      const { data: row, error: insertError } = await supabase
        .from(target.table)
        .insert({
          [target.foreignKey]: target.id,
          question: payload.question,
          question_image_path: null,
          options: payload.options,
          correct_index: payload.correctIndex,
          correct_indexes: payload.correctIndexes,
          explanation: payload.explanation,
          sort_order: payload.sortOrder,
        })
        .select("id")
        .maybeSingle();

      if (insertError || !row) {
        throw new Error(`Insert failed for question ${payload.number}: ${insertError?.message || "No row returned"}`);
      }

      inserted.push(row.id);
      const storagePath = await uploadImage(supabase, target, row.id, payload.number, payload.imagePath);
      uploadedPaths.push(storagePath);

      const { error: updateError } = await supabase
        .from(target.table)
        .update({ question_image_path: storagePath })
        .eq("id", row.id);

      if (updateError) {
        throw new Error(`Image path update failed for question ${payload.number}: ${updateError.message}`);
      }
    }
  } catch (error) {
    await Promise.allSettled(uploadedPaths.map((storagePath) => supabase.storage.from(BUCKET).remove([storagePath])));
    if (inserted.length > 0) {
      await supabase.from(target.table).delete().in("id", inserted);
    }
    throw error;
  }

  console.log(`Imported ${inserted.length} spatial skills questions.`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

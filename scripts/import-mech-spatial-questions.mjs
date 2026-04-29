import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ZIP_PATH = path.join(ROOT, "MECH QUESTION .zip");
const EXTRACT_DIR = path.join(ROOT, "tmp", "mech-question-import");
const HTML_PATH = path.join(EXTRACT_DIR, "MECHQUESTION.html");
const IMAGE_DIR = path.join(EXTRACT_DIR, "images");
const BUCKET = "question-images";
const TARGET_TEST_ID = 3;
const START_SORT_ORDER = 16;

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");

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

const extractZipIfNeeded = () => {
  if (fs.existsSync(HTML_PATH) && fs.existsSync(IMAGE_DIR)) return;

  if (!fs.existsSync(ZIP_PATH)) {
    throw new Error(`Missing zip: ${ZIP_PATH}`);
  }

  fs.mkdirSync(EXTRACT_DIR, { recursive: true });
  execFileSync("powershell", [
    "-NoProfile",
    "-Command",
    `Expand-Archive -LiteralPath ${JSON.stringify(ZIP_PATH)} -DestinationPath ${JSON.stringify(EXTRACT_DIR)} -Force`,
  ], { stdio: "inherit" });
};

const getImageOrderFromHtml = () => {
  const html = fs.readFileSync(HTML_PATH, "utf8");
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((match) => match[1].replace(/\\/g, "/"));
};

const makeQuestionPayloads = (imageOrder) => {
  const requiredImages = ["images/image2.jpg", "images/image4.jpg", "images/image1.jpg", "images/image3.jpg"];
  const missing = requiredImages.filter((image) => !imageOrder.includes(image));
  if (missing.length > 0) {
    throw new Error(`HTML image order did not contain expected images: ${missing.join(", ")}`);
  }

  return [
    {
      sortOrder: 16,
      imageRef: "images/image2.jpg",
      imageLabel: "gear",
      question: "",
      options: ["Clockwise", "Counter-clockwise", "It will not move", "It will move back and forth"],
      correctIndexes: [1],
      explanation: [
        "As Gear A spins clockwise, its teeth at the contact point are moving downward.",
        "Because the teeth are interlocked, they push Gear B's teeth downward as well.",
        "For the left side of Gear B to move down, the entire gear must rotate counter-clockwise.",
      ].join("\n"),
    },
    {
      sortOrder: 17,
      imageRef: "images/image4.jpg",
      imageLabel: "pulley",
      question: "",
      options: ["0.5 meters", "1 meter", "2 meters", "4 meters"],
      correctIndexes: [2],
      explanation:
        "A fixed pulley only changes the direction of your pull (allowing you to pull down instead of lifting up). It does not provide mechanical advantage, so the distance pulled always equals the distance lifted.",
    },
    {
      sortOrder: 18,
      imageRef: "images/image1.jpg",
      imageLabel: "cubes",
      question: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndexes: [0],
      explanation: [
        "Correct Answer: A is the valid cube. In the flat net, the Triangle (top), Circle (center), and Star (right) all meet at a single corner. Option A shows them in the correct orientation relative to each other.",
        "B is incorrect because it shows the Triangle and the Dot touching. In the net, they are separated by the Circle, meaning they are opposite faces and can never touch.",
        "C is incorrect because it shows the Square and the Star touching. Like the Triangle and Dot, these are opposites in the net.",
        "D is incorrect because while it has the right faces, the Triangle is pointing toward the Circle. In the net, the base of the Triangle sits against the Circle, so the tip should point away from it.",
      ].join("\n"),
    },
    {
      sortOrder: 19,
      imageRef: "images/image3.jpg",
      imageLabel: "lever-balance",
      question: "",
      options: ["Position 1", "Position 2", "It cannot be balanced", "Directly on the pivot"],
      correctIndexes: [0],
      explanation:
        "To balance a lever, a heavier weight must be placed closer to the pivot (fulcrum). Since 100kg is twice as heavy as 50kg, it must be placed at half the distance from the center to keep the beam level.",
    },
  ].map((entry) => ({
    ...entry,
    options: entry.options.map((text) => ({ text, image_path: null })),
    correctIndex: entry.correctIndexes[0] ?? null,
  }));
};

const getSupabase = async (env) => {
  const url = env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

  if (!url) throw new Error("Missing VITE_SUPABASE_URL in .env");

  if (serviceKey) {
    return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const email = env.SUPABASE_ADMIN_EMAIL;
  const password = env.SUPABASE_ADMIN_PASSWORD;
  if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY in .env");

  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  if (email && password) {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Admin login failed: ${error.message}`);
    return client;
  }

  if (APPLY) {
    throw new Error(
      "Live import needs SUPABASE_SERVICE_ROLE_KEY, or SUPABASE_ADMIN_EMAIL and SUPABASE_ADMIN_PASSWORD in .env. The anon key cannot upload because Storage RLS blocks it.",
    );
  }

  return client;
};

const uploadQuestionImage = async (supabase, questionId, payload) => {
  const sourcePath = path.join(EXTRACT_DIR, payload.imageRef);
  if (!fs.existsSync(sourcePath)) throw new Error(`Missing image file: ${sourcePath}`);

  const ext = path.extname(sourcePath).toLowerCase() || ".jpg";
  const fileName = sanitizeFileName(`${payload.imageLabel}${ext}`);
  const storagePath = `test-${TARGET_TEST_ID}/question-${questionId}/prompt/${Date.now()}-${fileName}`;
  const bytes = fs.readFileSync(sourcePath);
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(`Upload failed for ${payload.imageRef}: ${error.message}`);
  return storagePath;
};

const main = async () => {
  extractZipIfNeeded();
  const imageOrder = getImageOrderFromHtml();
  const payloads = makeQuestionPayloads(imageOrder);
  const env = loadEnv();
  const supabase = await getSupabase(env);

  const { data: rows, error } = await supabase
    .from("practice_test_questions")
    .select("id, sort_order, question_image_path, question")
    .eq("practice_test_id", TARGET_TEST_ID)
    .gte("sort_order", START_SORT_ORDER)
    .lte("sort_order", START_SORT_ORDER + payloads.length - 1)
    .order("sort_order");

  if (error) throw new Error(`Unable to load target questions: ${error.message}`);
  if (!rows || rows.length !== payloads.length) {
    throw new Error(`Expected ${payloads.length} target rows, found ${rows?.length ?? 0}.`);
  }

  const plan = payloads.map((payload) => {
    const row = rows.find((item) => item.sort_order === payload.sortOrder);
    if (!row) throw new Error(`Missing DB row for sort_order ${payload.sortOrder}`);
    return { row, payload };
  });

  console.log(`Mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
  console.table(plan.map(({ row, payload }) => ({
    sort_order: payload.sortOrder,
    question_id: row.id,
    image: payload.imageRef,
    label: payload.imageLabel,
    options: payload.options.map((option) => option.text).join(" | "),
    correct: payload.correctIndexes.map((index) => String.fromCharCode(65 + index)).join(", "),
    existing_image: row.question_image_path || "(none)",
  })));

  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply after adding SUPABASE_SERVICE_ROLE_KEY or admin credentials to .env.");
    return;
  }

  if (!FORCE) {
    const nonEmpty = plan.filter(({ row }) => row.question_image_path || row.question?.trim());
    if (nonEmpty.length > 0) {
      console.log("Some target rows already contain image paths or question text. Use --force to overwrite them.");
      console.table(nonEmpty.map(({ row }) => ({ sort_order: row.sort_order, id: row.id, image: row.question_image_path, question: row.question })));
      process.exitCode = 1;
      return;
    }
  }

  const uploaded = await Promise.all(plan.map(async ({ row, payload }) => ({
    row,
    payload,
    storagePath: await uploadQuestionImage(supabase, row.id, payload),
  })));

  try {
    for (const item of uploaded) {
      const { error: updateError } = await supabase
        .from("practice_test_questions")
        .update({
          question: item.payload.question,
          question_image_path: item.storagePath,
          options: item.payload.options,
          correct_index: item.payload.correctIndex,
          correct_indexes: item.payload.correctIndexes,
          explanation: item.payload.explanation,
        })
        .eq("id", item.row.id)
        .select("id")
        .maybeSingle();

      if (updateError) throw new Error(`DB update failed for question ${item.row.id}: ${updateError.message}`);
    }
  } catch (error) {
    await Promise.allSettled(uploaded.map((item) => supabase.storage.from(BUCKET).remove([item.storagePath])));
    throw error;
  }

  console.log("Import complete.");
  console.table(uploaded.map((item) => ({ sort_order: item.payload.sortOrder, question_id: item.row.id, path: item.storagePath })));
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

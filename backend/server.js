const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");
const OpenAI = require("openai");

// ==========================================
// GROQ AI CONFIGURATION
// ==========================================

const ai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const AI_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const AI_TEMPERATURE = 0.2;

// ==========================================
// EXPRESS APP
// ==========================================

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// POSTGRESQL DATABASE
// ==========================================

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// ==========================================
// DATABASE SCHEMA (idempotent, non-destructive)
// ==========================================

const ensureSchema = async () => {
  await pool.query(`
    ALTER TABLE complaints
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20),
      ADD COLUMN IF NOT EXISTS department VARCHAR(255),
      ADD COLUMN IF NOT EXISTS issue_type VARCHAR(255),
      ADD COLUMN IF NOT EXISTS summary TEXT,
      ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION;
  `);
};

// ==========================================
// CONSTANTS / VALIDATION
// ==========================================

const ALLOWED_CATEGORIES = [
  "Waste Management",
  "Water Supply",
  "Roads & Infrastructure",
  "Electricity",
  "Healthcare",
  "Education",
  "Traffic & Transport",
  "Government Services",
  "Environment",
  "Public Safety",
  "Housing & Land",
  "Telecom",
  "Tax & Revenue",
  "Law & Administration",
  "Other",
];

const ALLOWED_PRIORITIES = ["low", "medium", "high", "critical"];

const ALLOWED_STATUSES = ["pending", "in_progress", "resolved"];

// ==========================================
// AI ANALYSIS (shared by POST /api/ai/analyze
// and POST /api/complaints)
// ==========================================

const SYSTEM_PROMPT = `
You are SARATHI AI, an AI system that analyzes citizen complaints in Nepal.

Analyze the complaint and return ONLY valid JSON.

Allowed categories:

Waste Management
Water Supply
Roads & Infrastructure
Electricity
Healthcare
Education
Traffic & Transport
Government Services
Environment
Public Safety
Housing & Land
Telecom
Tax & Revenue
Law & Administration
Other

Priority must be exactly one of:

low
medium
high
critical

Choose the most appropriate Nepal government department.

Return exactly this JSON:

{
  "category": "...",
  "priority": "...",
  "department": "...",
  "issue_type": "...",
  "summary": "...",
  "confidence": 0.0
}

Rules:

- confidence must be a number between 0 and 1.
- summary must be short and clear.
- issue_type should describe the specific problem.
- category must be one of the allowed categories.
- priority must be one of the allowed priorities.
- Do not include markdown.
- Do not include explanations.
- Return JSON only.
`;

const clampConfidence = (value) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return Math.min(1, Math.max(0, num));
  }
  return 0;
};

const pickAllowed = (value, allowed, fallback) => {
  if (allowed.includes(value)) return value;
  const normalized = String(value || "").trim();
  const match = allowed.find(
    (item) => item.toLowerCase() === normalized.toLowerCase()
  );
  return match || fallback;
};

const parseAiJson = (text) => {
  if (!text || typeof text !== "string") return null;

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Fallback: extract the first JSON object if the model added extra prose.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err2) {
        return null;
      }
    }
    return null;
  }
};

const analyzeComplaint = async (title, description, location) => {
  const response = await ai.chat.completions.create({
    model: AI_MODEL,
    temperature: AI_TEMPERATURE,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `
Title:
${title}

Description:
${description}

Location:
${location || "Not provided"}
`,
      },
    ],
  });

  const aiText = response.choices && response.choices[0]
    ? response.choices[0].message && response.choices[0].message.content
    : null;

  const raw = parseAiJson(aiText);
  if (!raw || typeof raw !== "object") {
    throw new Error("AI returned invalid JSON");
  }

  const analysis = {
    category: pickAllowed(raw.category, ALLOWED_CATEGORIES, "Other"),
    priority: pickAllowed(raw.priority, ALLOWED_PRIORITIES, "medium"),
    department: String(raw.department || "").trim(),
    issue_type: String(raw.issue_type || "").trim(),
    summary: String(raw.summary || "").trim(),
    confidence: clampConfidence(raw.confidence),
  };

  if (!analysis.department) analysis.department = null;
  if (!analysis.issue_type) analysis.issue_type = null;
  if (!analysis.summary) analysis.summary = null;

  return analysis;
};

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "SARATHI Backend is running 🚀",
  });
});

// ==========================================
// GET ALL COMPLAINTS (with optional filters)
// ==========================================

app.get("/api/complaints", async (req, res) => {
  try {
    const { category, priority, status, department } = req.query;

    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (department) {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT * FROM complaints
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get complaints error:", error.message);

    res.status(500).json({
      message: "Failed to get complaints",
      error: error.message,
    });
  }
});

// ==========================================
// DASHBOARD STATISTICS
// (registered before /:id so "stats" is never
// treated as an id)
// ==========================================

app.get("/api/complaints/stats", async (req, res) => {
  try {
    const [totalRes, statusRes, priorityRes, categoryRes, departmentRes] =
      await Promise.all([
        pool.query("SELECT COUNT(*) AS count FROM complaints"),
        pool.query(
          "SELECT status, COUNT(*) AS count FROM complaints GROUP BY status"
        ),
        pool.query(
          "SELECT priority, COUNT(*) AS count FROM complaints GROUP BY priority"
        ),
        pool.query(
          "SELECT category, COUNT(*) AS count FROM complaints GROUP BY category ORDER BY count DESC"
        ),
        pool.query(
          "SELECT department, COUNT(*) AS count FROM complaints GROUP BY department ORDER BY count DESC"
        ),
      ]);

    const total = Number(totalRes.rows[0].count);

    const countByStatus = { pending: 0, in_progress: 0, resolved: 0 };
    statusRes.rows.forEach((row) => {
      countByStatus[row.status] = Number(row.count);
    });

    const countByPriority = { low: 0, medium: 0, high: 0, critical: 0 };
    priorityRes.rows.forEach((row) => {
      countByPriority[row.priority] = Number(row.count);
    });

    res.json({
      total,
      pending: countByStatus.pending,
      in_progress: countByStatus.in_progress,
      resolved: countByStatus.resolved,
      critical: countByPriority.critical,
      high: countByPriority.high,
      medium: countByPriority.medium,
      low: countByPriority.low,
      by_status: countByStatus,
      by_priority: countByPriority,
      by_category: categoryRes.rows.map((row) => ({
        category: row.category,
        count: Number(row.count),
      })),
      by_department: departmentRes.rows.map((row) => ({
        department: row.department,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error("Get stats error:", error.message);

    res.status(500).json({
      message: "Failed to get complaint statistics",
      error: error.message,
    });
  }
});

// ==========================================
// GET SINGLE COMPLAINT
// ==========================================

const isValidId = (id) => /^\d+$/.test(String(id));

app.get("/api/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid complaint id",
      });
    }

    const result = await pool.query("SELECT * FROM complaints WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get complaint error:", error.message);

    res.status(500).json({
      message: "Failed to get complaint",
      error: error.message,
    });
  }
});

// ==========================================
// CREATE COMPLAINT (with automatic AI analysis)
// ==========================================

app.post("/api/complaints", async (req, res) => {
  try {
    const { title, description, location, user_id } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        message: "title is required",
      });
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        message: "description is required",
      });
    }

    // --- Step 1: Analyze with SARATHI AI ---
    const analysis = await analyzeComplaint(title, description, location);

    // --- Step 2: Insert complaint with AI-generated fields ---
    const result = await pool.query(
      `INSERT INTO complaints
      (
        user_id,
        title,
        description,
        location,
        category,
        priority,
        department,
        issue_type,
        summary,
        confidence,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        user_id && isValidId(user_id) ? user_id : null,
        String(title).trim(),
        String(description).trim(),
        location ? String(location).trim() : null,
        analysis.category,
        analysis.priority,
        analysis.department,
        analysis.issue_type,
        analysis.summary,
        analysis.confidence,
        "pending",
      ]
    );

    res.status(201).json({
      message: "Complaint created successfully",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("Create complaint error:", error.message);

    res.status(500).json({
      message: "Failed to create complaint",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE COMPLAINT
// ==========================================

app.patch("/api/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid complaint id",
      });
    }

    const {
      title,
      description,
      location,
      category,
      priority,
      department,
      issue_type,
      summary,
      confidence,
      status,
    } = req.body;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority. Must be one of: ${ALLOWED_PRIORITIES.join(", ")}`,
      });
    }

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Must be one of the allowed categories`,
      });
    }

    const result = await pool.query(
      `UPDATE complaints
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         location = COALESCE($3, location),
         category = COALESCE($4, category),
         priority = COALESCE($5, priority),
         department = COALESCE($6, department),
         issue_type = COALESCE($7, issue_type),
         summary = COALESCE($8, summary),
         confidence = COALESCE($9, confidence),
         status = COALESCE($10, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        title,
        description,
        location,
        category,
        priority,
        department,
        issue_type,
        summary,
        confidence,
        status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json({
      message: "Complaint updated successfully",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("Update complaint error:", error.message);

    res.status(500).json({
      message: "Failed to update complaint",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE COMPLAINT
// ==========================================

app.delete("/api/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid complaint id",
      });
    }

    const result = await pool.query(
      "DELETE FROM complaints WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json({
      message: "Complaint deleted successfully",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("Delete complaint error:", error.message);

    res.status(500).json({
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
});

// ==========================================
// SARATHI AI ANALYSIS (standalone)
// ==========================================

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "title and description are required",
      });
    }

    const analysis = await analyzeComplaint(title, description, location);

    res.json({
      message: "Complaint analyzed successfully",
      analysis,
    });
  } catch (error) {
    console.error("AI analysis error:", error.message);

    res.status(500).json({
      message: "Failed to analyze complaint",
      error: error.message,
    });
  }
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5001;

// Test database connection, ensure schema, then listen.
(async () => {
  try {
    await pool.connect();
    console.log("PostgreSQL connected successfully ✅");

    await ensureSchema();
    console.log("Database schema is up to date ✅");
  } catch (error) {
    console.error("PostgreSQL setup failed ❌");
    console.error(error.message);
  }

  app.listen(PORT, () => {
    console.log(`SARATHI Backend running on http://localhost:${PORT} 🚀`);
  });
})();
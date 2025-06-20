// server/index.js
// 1) Load .env immediately
require('dotenv').config();

// 2) Define your URLs
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const DISCORD_CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/auth/discord/callback';

// 3) Now you can safely log them
console.log('🔹 FRONTEND URL:', FRONTEND);
console.log('🔹 DISCORD CALLBACK URL:', DISCORD_CALLBACK_URL);

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
// ─── MULTER SETUP FOR ATTACHMENTS ──────────────────────────────────────────
// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Store uploads to disk under server/uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `job-${req.params.id}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Import modules
const assetDB     = require('./assets');
const leaderboard = require('./leaderboard');
const jobs        = require('./jobs');
const sourcing    = require('./sourcing'); // ← Import new sourcing module

const app = express();
app.use(cors({
  origin: 'https://thenest-web.onrender.com',  // your front-end URL
  credentials: true
}));
const PORT = process.env.PORT || 3001;



// still serve your uploads folder under /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === JSON/Quiz Data ===
const questions = require('./questions.json');
const module2   = require('./module_2_gasketology.json');

// === Middleware ===
app.use(cors({ origin: FRONTEND,              credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: 'super_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());


// === Discord Auth ===
passport.use(
  new DiscordStrategy(
    {
      clientID: '1377007649924714506',
      clientSecret: 'caT5jRYxfjJL5z_Lirn0ANQOK6Xu4xgk',
      callbackURL: DISCORD_CALLBACK_URL,    // ← use the env-driven constant
      scope: ['identify'],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));


// === Quiz Endpoints ===
app.get('/api/questions', (req, res) => {
  res.json(questions);
});
app.get('/api/module2', (req, res) => {
  res.json(module2);
});
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// === Asset Manager API ===
// 1) GET all assets
app.get('/api/assets', (req, res) => {
  try {
    const data = assetDB.getAllAssets();
    res.json(data);
  } catch (err) {
    console.error('Failed to get assets:', err);
    res.status(500).json({ error: 'Failed to load assets' });
  }
});
// 2) POST new asset (single)
app.post('/api/assets', (req, res) => {
  try {
    const discordUser = req.user?.username || 'Unknown User';
    assetDB.addAsset(req.body, discordUser);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to add asset:', err);
    res.status(500).json({ error: 'Failed to add asset' });
  }
});
// 3) PUT update/transfer single asset
app.put('/api/assets/:id', (req, res) => {
  try {
    const assetId     = req.params.id;
    const discordUser = req.user?.username || 'Unknown User';
    assetDB.updateAsset(assetId, req.body, discordUser);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update asset:', err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});
// 4) DELETE single asset by ID
app.delete('/api/assets/:id', (req, res) => {
  try {
    const assetId     = req.params.id;
    const discordUser = req.user?.username || 'Unknown User';
    assetDB.deleteAsset(assetId, discordUser);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete asset:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});
// 5) POST transfer multiple assets at once
app.post('/api/assets/transfer', (req, res) => {
  try {
    const { assetIds, newLocation } = req.body;
    if (!Array.isArray(assetIds) || !newLocation) {
      return res
        .status(400)
        .json({ error: 'Must provide assetIds array and newLocation.' });
    }
    const discordUser = req.user?.username || 'Unknown User';
    assetDB.transferMultipleAssets(assetIds, newLocation, discordUser);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to transfer multiple assets:', err);
    res.status(500).json({ error: 'Failed to transfer multiple assets' });
  }
});
// 6) GET activity log entries
app.get('/api/activity', (req, res) => {
  try {
    const logs = assetDB.getActivityLog();
    res.json(logs);
  } catch (err) {
    console.error('Failed to fetch activity logs:', err);
    res.status(500).json({ error: 'Failed to load activity logs' });
  }
});

// === Job Planner API ===
// GET all jobs
app.get('/api/jobs', (req, res) => {
  try {
    const data = jobs.getAllJobs();
   // Attach auditChecklistUrl if file exists
   const augmented = data.map((job) => {
     const filename = `job-${job.id}.pdf`;
     const filepath = path.join(__dirname, 'uploads', filename);
     if (fs.existsSync(filepath)) {
       return { ...job, auditChecklistUrl: `/uploads/${filename}` };
     }
     return job;
   });
   res.json(augmented);
  } catch (err) {
    console.error('Failed to get jobs:', err);
    res.status(500).json({ error: 'Failed to load jobs' });
  }
});
// GET monthly well totals for the current year
app.get('/api/jobs/monthly-totals', (req, res) => {
  try {
    const all = jobs.getAllJobs();
    const YEAR = new Date().getFullYear();

    // aggregate per-month
    const monthly = all
      .filter(j => new Date(j.rig_in_date).getFullYear() === YEAR)
      .reduce((acc, job) => {
        const m = new Date(job.rig_in_date).getMonth();
        if (!acc[m]) acc[m] = {
          wells: 0,
          valve_7_1_16: 0,
          valve_5_1_8: 0,
          hyd_3_1_16: 0,
          man_3_1_16: 0,
          gateway_pods: 0,
          awc_pods: 0,
          grease_unit: 0,
          coil_trees: 0,
          accumulator: 0,
          techs: 0,
          work_orders: 0
        };
        acc[m].wells            += Number(job.num_wells   || 0);
        acc[m].valve_7_1_16     += Number(job.valve_7_1_16 || 0);
        acc[m].valve_5_1_8      += Number(job.valve_5_1_8  || 0);
        acc[m].hyd_3_1_16       += Number(job.valve_hyd    || 0);
        acc[m].man_3_1_16       += Number(job.valve_man    || 0);
        acc[m].gateway_pods     += Number(job.gateway_pods || 0);
        acc[m].awc_pods         += Number(job.awc_pods     || 0);
        acc[m].grease_unit      += Number(job.grease_unit  || 0);
        acc[m].coil_trees       += Number(job.coil_trees   || 0);
        acc[m].accumulator      += Number(job.accumulator  || 0);
        // techs and work_orders are stored as text—coerce to number if numeric
        acc[m].techs            += Number(job.techs       ) || 0;
        acc[m].work_orders      += Number(job.work_orders ) || 0;
        return acc;
      }, {});

    // ensure all 12 months present
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const result = MONTH_NAMES.map((mon, i) => ({
      month: mon,
      ...monthly[i]  // if undefined, MONTH_NAMES[i] => {} so fields come through as undefined; you can default in front-end
    }));

    res.json(result);
  } catch (err) {
    console.error('Failed to get monthly totals for all metrics:', err);
    res.status(500).json({ error: 'Failed to load monthly totals' });
  }
});

// POST new job
app.post('/api/jobs', (req, res) => {
  try {
    jobs.addJob(req.body);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to add job:', err);
    res.status(500).json({ error: 'Failed to add job' });
  }
});
// PUT update entire job record
app.put('/api/jobs/:id', (req, res) => {
  try {
    jobs.updateJob(Number(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to update job:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});
// ─── PATCH: update just a subset of fields (e.g. status) ─────────────────
app.patch('/api/jobs/:id', (req, res) => {
  try {
    const jobId = Number(req.params.id);
    jobs.updateJob(jobId, req.body);
    const updatedJob = jobs.getJobById(jobId);
    res.json(updatedJob);
  } catch (err) {
    console.error('Failed to patch job:', err);
    res.status(500).json({ error: 'Failed to update job' });
  }
});
// DELETE a job
app.delete('/api/jobs/:id', (req, res) => {
  try {
    const jobId = Number(req.params.id);
    jobs.deleteJob(jobId);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete job:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});
// ─── POST: upload Audit Checklist for a job ────────────────────────────────
app.post(
  '/api/jobs/:id/audit-checklist',
  upload.single('auditChecklist'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Files are now in server/uploads/job-<id>.<ext>
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  }
);

+// ─── DELETE: remove Audit Checklist for a job ──────────────────────────────
+app.delete('/api/jobs/:id/audit-checklist', (req, res) => {
  try {
    const jobId = req.params.id.toString();
    // find any file named job-<id>.* in uploads
    const files = fs
      .readdirSync(uploadDir)
      .filter(fn => fn.startsWith(`job-${jobId}.`));
    if (files.length === 0) {
      return res.status(404).json({ error: 'Audit file not found' });
    }
    // delete each matching file
    files.forEach(fn => {
      fs.unlinkSync(path.join(uploadDir, fn));
    });
    // success
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete audit file:', err);
    res.status(500).json({ error: 'Failed to delete audit file' });
  }
});
// === Leaderboard API ===
app.post('/api/score', (req, res) => {
  const { userId, username, module, score } = req.body;
  leaderboard.updateScore({ userId, username, module, score });
  res.json({ success: true });
});
app.get('/api/leaderboard', (req, res) => {
  const data = leaderboard.getLeaderboard();
  res.json(data);
});

// === Workorders API (stub) ===
app.get('/api/workorders', (req, res) => {
  return res.json([]);
});

// ─── TEST: Load & Annotate the Blank Workorder Template ───────────────
app.get('/api/workorder/test-template', async (req, res) => {
  try {
    // 1) Path to blank template:
    const templatePath = path.join(
      __dirname,
      'templates',
      'Workorder Blank NEST.pdf'
    );

    // 2) Read PDF
    const existingPdfBytes = fs.readFileSync(templatePath);

    // 3) Load PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 4) Grab first page
    const [firstPage] = pdfDoc.getPages();

    // 5) Embed font
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // 6) Draw plain text (no emojis)
    firstPage.drawText('PDF Template Loaded!', {
      x: 50,
      y: 750,
      size: 14,
      font: timesFont,
      color: rgb(1, 0, 0),
    });

    // 7) Serialize
    const pdfBytes = await pdfDoc.save();

    // 8) Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="workorder_test.pdf"'
    );
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error loading or annotating PDF:', err);
    return res.status(500).send('Failed to load PDF template');
  }
});
// ────────────────────────────────────────────────────────────────────────────

// ─── GENERATE: Populate the Blank Workorder Template ──────────────────────
app.post('/api/workorder/generate', async (req, res) => {
  try {
    // 1) Extract fields from request body
    const { customer, location, wells, rigInDate, revision } = req.body;
    if (!customer || !location || !wells || !rigInDate || !revision) {
      return res.status(400).json({
        error:
          'Must include customer, location, wells, rigInDate, and revision in the request body.',
      });
    }

    // 2) Path to template:
    const templatePath = path.join(
      __dirname,
      'templates',
      'Workorder Blank NEST.pdf'
    );

    // 3) Read PDF bytes
    const existingPdfBytes = fs.readFileSync(templatePath);

    // 4) Load PDFDocument
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 5) Grab first page
    const [firstPage] = pdfDoc.getPages();

    // 6) Embed a font
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 7) Approximate X/Y coordinates (tweak as needed)
    const coords = {
      customer: { x: 90, y: 738 },
      location: { x: 350, y: 738 },
      wells: { x: 550, y: 738 },
      rigInDate: { x: 160, y: 712 },
      revision: { x: 572, y: 712 },
    };
    const fontSize = 10;

    // 8) Draw each field
    firstPage.drawText(customer, {
      x: coords.customer.x,
      y: coords.customer.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(location, {
      x: coords.location.x,
      y: coords.location.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(String(wells), {
      x: coords.wells.x,
      y: coords.wells.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(rigInDate, {
      x: coords.rigInDate.x,
      y: coords.rigInDate.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(revision, {
      x: coords.revision.x,
      y: coords.revision.y,
      size: fontSize,
      font: helveticaBold,
      color: rgb(1, 0, 0),
    });

    // 9) Serialize and return the populated PDF
    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="workorder_populated.pdf"'
    );
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Error generating the populated PDF:', err);
    return res.status(500).json({ error: 'Failed to generate workorder PDF' });
  }
});
// ────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

// ─── SOURCING API ──────────────────────────────────────────────────────────

// GET all sourcing tickets, with optional filtering by status/priority/category
app.get('/api/sourcing', (req, res) => {
  try {
    let all = sourcing.getAllTickets();
    const { status, priority, category } = req.query;

    if (status) {
      all = all.filter((t) => t.status === status);
    }
    if (priority) {
      all = all.filter((t) => t.priority === priority);
    }
    if (category) {
      all = all.filter((t) => t.category === category);
    }

    return res.json(all);
  } catch (err) {
    console.error('Failed to fetch sourcing tickets:', err);
    return res.status(500).json({ error: 'Failed to load sourcing tickets' });
  }
});

// POST a new sourcing ticket
app.post('/api/sourcing', (req, res) => {
  try {
    const {
      itemDescription,
      base,
      neededBy,
      quantity,
      project,
      vendor = '',
      category = 'Other',
      priority = 'Medium',
      status = 'Requested',
      expectedDate = '',
    } = req.body;

    if (
      !itemDescription ||
      !base ||
      !neededBy ||
      quantity === undefined ||
      !project
    ) {
      return res.status(400).json({
        error:
          'Must provide itemDescription, base, neededBy, quantity, and project in the request body.',
      });
    }

    // Validate neededBy
    const nb = new Date(neededBy);
    if (isNaN(nb.getTime())) {
      return res.status(400).json({ error: 'neededBy must be a valid date.' });
    }

    // Create ticket
    const newTicket = sourcing.addTicket({
      itemDescription,
      base,
      neededBy,
      quantity,
      project,
      vendor,
      category,
      priority,
      status,
      expectedDate,
    });
    return res.status(201).json(newTicket);
  } catch (err) {
    console.error('Failed to add sourcing ticket:', err);
    return res.status(500).json({ error: 'Failed to create sourcing ticket' });
  }
});

// PUT update an entire ticket (any fields: status, priority, category, expectedDate, vendor, etc.)
app.put('/api/sourcing/:id', (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const updates  = req.body;

    // If updating dates, validate them
    if (updates.neededBy) {
      const nb = new Date(updates.neededBy);
      if (isNaN(nb.getTime())) {
        return res.status(400).json({ error: 'neededBy must be valid date.' });
      }
    }
    if (updates.expectedDate) {
      const ed = new Date(updates.expectedDate);
      if (isNaN(ed.getTime())) {
        return res
          .status(400)
          .json({ error: 'expectedDate must be a valid date.' });
      }
    }

    const updatedTicket = sourcing.updateTicket(ticketId, updates);
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    return res.json(updatedTicket);
  } catch (err) {
    console.error('Failed to update sourcing ticket:', err);
    return res.status(500).json({ error: 'Failed to update sourcing ticket' });
  }
});

// ─── PATCH to update only expectedDate ───────────────────────────────────────
app.patch('/api/sourcing/:id', (req, res) => {
  try {
    const ticketId     = Number(req.params.id);
    const { expectedDate } = req.body;
    if (!expectedDate) {
      return res.status(400).json({ error: 'expectedDate is required' });
    }
    // Validate expectedDate
    const ed = new Date(expectedDate);
    if (isNaN(ed.getTime())) {
      return res.status(400).json({ error: 'expectedDate must be valid date.' });
    }
    const updated = sourcing.updateTicket(ticketId, { expectedDate });
    return res.json(updated);
  } catch (err) {
    console.error('Failed to patch expectedDate:', err);
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// DELETE a sourcing ticket
app.delete('/api/sourcing/:id', (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    sourcing.deleteTicket(ticketId);
    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete sourcing ticket:', err);
    return res.status(500).json({ error: 'Failed to delete sourcing ticket' });
  }
});

// POST upload an attachment for a given ticket ID
app.post(
  '/api/sourcing/:id/attachment',
  upload.single('attachment'),
  (req, res) => {
    try {
      const ticketId = Number(req.params.id);
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const relPath = sourcing.addAttachmentToTicket(
        ticketId,
        req.file.originalname,
        req.file.buffer
      );
      return res.json({ path: relPath });
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      return res.status(400).json({ error: err.message });
    }
  }
);
// 1) Kick off the OAuth flow
app.get(
  '/auth/discord',
  passport.authenticate('discord')
);

// 2) Handle Discord’s response
app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    // On success, send the user back to your frontend
    res.redirect(
      `${FRONTEND}/?user=${encodeURIComponent(JSON.stringify(req.user))}`
    );
  }
);



// …


// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ API running at http://localhost:${PORT}`);
});

// server/routes/quiz.js
const router = require('express').Router();
const questions = require('../questions.json');
const module2   = require('../module_2_gasketology.json');

// GET /api/quiz/questions
router.get('/questions', (req, res) => {
  res.json(questions);
});

// GET /api/quiz/module2
router.get('/module2', (req, res) => {
  res.json(module2);
});

module.exports = router;

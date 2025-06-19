const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'leaderboard.json');

function getLeaderboard() {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function updateScore({ userId, username, module, score }) {
  const data = getLeaderboard();
  const index = data.findIndex(entry => entry.userId === userId && entry.module === module);

  if (index !== -1) {
    data[index].score = Math.max(data[index].score, score);
  } else {
    data.push({ userId, username, module, score });
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { getLeaderboard, updateScore };

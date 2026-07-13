
function calculateScore(findings) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.severity === 'critical') {
      score -= 10;
    } else if (finding.severity === 'warning') {
      score -= 5;
    } else {
      score -= 2; // info
    }
  });

  return Math.max(score, 0);
}

module.exports = { calculateScore };
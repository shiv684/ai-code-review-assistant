function calculateScore(messages) {
  let score = 100;

  messages.forEach((msg) => {
    if (msg.severity === 2) {
      score -= 8; // error → bada deduction
    } else {
      score -= 3; // warning → chhota deduction
    }
  });

  return Math.max(score, 0); // score kabhi negative na ho
}

module.exports = { calculateScore };
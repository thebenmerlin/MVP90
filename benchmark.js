function original() {
  return Array.from({ length: 15 }, (_, i) => ({
    day: i === 0 ? 'Launch' : `+${i}d`,
    upvotes: i === 0 ? 89 : Math.max(0, 89 - Math.floor(Math.random() * 10) - i * 2),
    cumulative: Array.from({ length: i + 1 }, (_, j) =>
      j === 0 ? 89 : Math.max(0, 89 - Math.floor(Math.random() * 10) - j * 2)
    ).reduce((a, b) => a + b, 0)
  }));
}

function optimized() {
  let cumulativeSum = 0;
  return Array.from({ length: 15 }, (_, i) => {
    const upvotes = i === 0 ? 89 : Math.max(0, 89 - Math.floor(Math.random() * 10) - i * 2);
    cumulativeSum += upvotes;
    return {
      day: i === 0 ? 'Launch' : `+${i}d`,
      upvotes,
      cumulative: cumulativeSum
    };
  });
}

function runBenchmark(fn, iterations) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}

const iterations = 100000;
// Warmup
runBenchmark(original, 10000);
runBenchmark(optimized, 10000);

const timeOriginal = runBenchmark(original, iterations);
const timeOptimized = runBenchmark(optimized, iterations);

console.log(`Original: ${timeOriginal.toFixed(2)} ms`);
console.log(`Optimized: ${timeOptimized.toFixed(2)} ms`);
console.log(`Improvement: ${((timeOriginal - timeOptimized) / timeOriginal * 100).toFixed(2)}%`);

export interface DataPoint {
  id: number;
  productId: number;
  qty: number;
  revenue: number;
  frequency: number;
}

export interface ClusterResult {
  productId: number;
  cluster: "High" | "Medium" | "Low";
}

export function runKMeans(data: DataPoint[], k: number = 3): ClusterResult[] {
  if (data.length < k) return data.map(d => ({ productId: d.productId, cluster: "Medium" }));

  // 1. Normalize data (0 to 1 scale)
  const maxQty = Math.max(...data.map(d => d.qty)) || 1;
  const maxRev = Math.max(...data.map(d => d.revenue)) || 1;
  const maxFreq = Math.max(...data.map(d => d.frequency)) || 1;

  const normalized = data.map(d => ({
    ...d,
    nQty: d.qty / maxQty,
    nRev: d.revenue / maxRev,
    nFreq: d.frequency / maxFreq,
  }));

  // 2. Initialize centroids (simple approach: pick k points)
  let centroids = normalized.slice(0, k).map(d => ({
    qty: d.nQty,
    rev: d.nRev,
    freq: d.nFreq,
  }));

  let assignments = new Array(normalized.length).fill(-1);
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 100) {
    changed = false;
    iterations++;

    // Assignment phase
    normalized.forEach((point, i) => {
      let minDist = Infinity;
      let closestCluster = -1;

      centroids.forEach((centroid, j) => {
        const dist = Math.sqrt(
          Math.pow(point.nQty - centroid.qty, 2) +
          Math.pow(point.nRev - centroid.rev, 2) +
          Math.pow(point.nFreq - centroid.freq, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          closestCluster = j;
        }
      });

      if (assignments[i] !== closestCluster) {
        assignments[i] = closestCluster;
        changed = true;
      }
    });

    // Update phase
    const newCentroids = Array.from({ length: k }, () => ({ qty: 0, rev: 0, freq: 0, count: 0 }));
    assignments.forEach((clusterIdx, i) => {
      newCentroids[clusterIdx].qty += normalized[i].nQty;
      newCentroids[clusterIdx].rev += normalized[i].nRev;
      newCentroids[clusterIdx].freq += normalized[i].nFreq;
      newCentroids[clusterIdx].count++;
    });

    centroids = newCentroids.map(c => ({
      qty: c.count > 0 ? c.qty / c.count : 0,
      rev: c.count > 0 ? c.rev / c.count : 0,
      freq: c.count > 0 ? c.freq / c.count : 0,
    }));
  }

  // 3. Map clusters to meaningful labels (High, Medium, Low)
  // We sort clusters by their average revenue/qty to assign labels
  const clusterAverages = centroids.map((c, i) => ({
    index: i,
    score: c.qty + c.rev + c.freq,
  })).sort((a, b) => b.score - a.score);

  const labelMap: Record<number, "High" | "Medium" | "Low"> = {
    [clusterAverages[0].index]: "High",
    [clusterAverages[1].index]: "Medium",
    [clusterAverages[2].index]: "Low",
  };

  return data.map((point, i) => ({
    productId: point.productId,
    cluster: labelMap[assignments[i]],
  }));
}

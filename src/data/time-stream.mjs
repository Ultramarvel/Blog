const xs = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];

const makeBoundary = (ys) => xs.map((x, index) => [x, ys[index]]);

export const streamBoundaries = [
  makeBoundary([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  makeBoundary([0, 0, 55, 215, 250, 170, 150, 145, 145, 145, 145, 105, 155]),
  makeBoundary([0, 0, 55, 215, 250, 205, 195, 215, 220, 210, 205, 160, 195]),
  makeBoundary([0, 0, 55, 215, 250, 235, 300, 300, 305, 300, 295, 230, 260]),
  makeBoundary([0, 0, 55, 215, 250, 290, 380, 370, 355, 345, 335, 290, 315]),
  makeBoundary([420, 420, 420, 420, 420, 420, 420, 420, 420, 420, 420, 420, 420]),
];

export const sampleBoundaryY = (points, x) => {
  const clampedX = Math.max(points[0][0], Math.min(points[points.length - 1][0], x));
  const segment = Math.min(Math.floor(clampedX / 300), 3);
  const startIndex = segment * 3;
  const start = points[startIndex];
  const controlOne = points[startIndex + 1];
  const controlTwo = points[startIndex + 2];
  const end = points[startIndex + 3];
  const progress = (clampedX - start[0]) / (end[0] - start[0]);
  const inverse = 1 - progress;
  return inverse ** 3 * start[1]
    + 3 * inverse ** 2 * progress * controlOne[1]
    + 3 * inverse * progress ** 2 * controlTwo[1]
    + progress ** 3 * end[1];
};

const boundaryPath = (points) => {
  let path = `M${points[0][0]} ${points[0][1]}`;
  for (let index = 1; index < points.length; index += 3) {
    const controlOne = points[index];
    const controlTwo = points[index + 1];
    const end = points[index + 2];
    path += `C${controlOne[0]} ${controlOne[1]} ${controlTwo[0]} ${controlTwo[1]} ${end[0]} ${end[1]}`;
  }
  return path;
};

const reverseBoundaryPath = (points) => {
  let path = '';
  for (let index = points.length - 1; index >= 3; index -= 3) {
    const controlOne = points[index - 1];
    const controlTwo = points[index - 2];
    const end = points[index - 3];
    path += `C${controlOne[0]} ${controlOne[1]} ${controlTwo[0]} ${controlTwo[1]} ${end[0]} ${end[1]}`;
  }
  return path;
};

const bandPath = (upper, lower) => {
  const lowerEnd = lower[lower.length - 1];
  return `${boundaryPath(upper)}L${lowerEnd[0]} ${lowerEnd[1]}${reverseBoundaryPath(lower)}Z`;
};

const layerDefinitions = [
  { key: 'study', title: '学习', label: '学习', x: 300, y: 116, labelWidth: 52 },
  { key: 'movement', title: '音乐与运动', label: '音乐 / 运动', x: 766, y: 265, labelWidth: 128, mobileX: 700, mobileY: 256 },
  { key: 'game', title: '游戏', label: '游戏', x: 900, y: 178, labelWidth: 52, mobileX: 700, mobileY: 178 },
  { key: 'work', title: '编程与工作', label: '编程 / 工作', x: 800, y: 328, labelWidth: 120, mobileX: 700, mobileY: 335 },
  { key: 'family', title: '社交与家庭', label: '社交 / 家庭', x: 100, y: 335, labelWidth: 140 },
];

export const streamBands = layerDefinitions.map((layer, index) => ({
  ...layer,
  path: bandPath(streamBoundaries[index], streamBoundaries[index + 1]),
}));

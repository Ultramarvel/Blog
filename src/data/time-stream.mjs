const xs = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];

const makeBoundary = (ys) => xs.map((x, index) => [x, ys[index]]);

export const streamBoundaries = [
  makeBoundary([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  makeBoundary([110, 110, 240, 250, 250, 170, 160, 145, 145, 145, 145, 120, 120]),
  makeBoundary([110, 110, 245, 260, 270, 230, 225, 215, 245, 240, 235, 180, 178]),
  makeBoundary([110, 115, 255, 280, 295, 300, 300, 305, 290, 285, 275, 235, 228]),
  makeBoundary([110, 125, 285, 310, 330, 400, 395, 385, 345, 340, 330, 295, 270]),
  makeBoundary([420, 420, 420, 420, 420, 420, 420, 420, 420, 420, 420, 420, 420]),
];

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
  { key: 'study', title: '学习', label: '学习', x: 300, y: 116 },
  { key: 'movement', title: '音乐与运动', label: '音乐 / 运动', x: 900, y: 178 },
  { key: 'game', title: '游戏', label: '游戏', x: 600, y: 265 },
  { key: 'work', title: '编程与工作', label: '编程 / 工作', x: 900, y: 318 },
  { key: 'family', title: '社交与家庭', label: '社交 / 家庭', x: 100, y: 232 },
];

export const streamBands = layerDefinitions.map((layer, index) => ({
  ...layer,
  path: bandPath(streamBoundaries[index], streamBoundaries[index + 1]),
}));

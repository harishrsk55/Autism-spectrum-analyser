function generateHeatmap() {
  const container = document.getElementById('heatmapContainer');

  // Remove any existing heatmap canvas
  const oldCanvas = container.querySelector("canvas");
  if (oldCanvas) oldCanvas.remove();

  const heatmapInstance = h337.create({
    container: container,
    radius: 40,
    maxOpacity: 0.6,
    minOpacity: 0.2,
    blur: 0.85,
  });

  const testData = {
    max: 10,
    data: [
      { x: 150, y: 120, value: 7 },
      { x: 300, y: 200, value: 6 },
      { x: 500, y: 300, value: 10 },
      { x: 700, y: 420, value: 9 },
    ],
  };

  heatmapInstance.setData(testData);
}

// Expose the function to the global scope
window.generateHeatmap = generateHeatmap;
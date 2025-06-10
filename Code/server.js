
import express from 'express';
import { WebSocketServer } from 'ws';
import cv from 'opencv4nodejs';
import { YOLO } from 'ultralytics';

const app = express();
const port = 3000;

// Serve static frontend files
app.use(express.static('public'));

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// WebSocket server for real-time frames
const wss = new WebSocketServer({ server });

// Load pose model once
const model = new YOLO('yolov8n-pose.pt');

wss.on('connection', ws => {
  const cap = new cv.VideoCapture(0);
  cap.set(cv.CAP_PROP_FRAME_WIDTH, 640);
  cap.set(cv.CAP_PROP_FRAME_HEIGHT, 480);

  const interval = setInterval(async () => {
    let frame = cap.read();
    if (frame.empty) frame = cap.read();

    // Encode frame to JPEG
    const jpg = cv.imencode('.jpg', frame).toString('base64');

    // Run inference
    const results = await model.predict(frame);
    const data = results[0];
    const boxes = data.boxes.xyxy.tolist();
    const kpts = data.keypoints.data[0].tolist();

    // Send data + frame to client
    ws.send(JSON.stringify({ jpg, boxes, kpts }));
  }, 100);

  ws.on('close', () => {
    clearInterval(interval);
    cap.release();
  });
});
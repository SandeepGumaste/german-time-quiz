// Records microphone audio in the browser. `result` resolves with the recording when it stops, either
// through `stop()` or on its own after `maxMs`.
export type Recording = { stop: () => void; result: Promise<Blob> };

const TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export async function startRecording(maxMs = 8000): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = TYPES.find((t) => MediaRecorder.isTypeSupported(t));
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  const done = new Promise<Blob>((resolve) => {
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      clearTimeout(timer);
      resolve(new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" }));
    };
  });
  const timer = setTimeout(() => recorder.state !== "inactive" && recorder.stop(), maxMs);
  recorder.start();
  return {
    stop: () => recorder.state !== "inactive" && recorder.stop(),
    result: done,
  };
}

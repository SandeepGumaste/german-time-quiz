

"use client";
import React, { useState } from "react";
import { generateTimeJson } from "@/lib/utils";

type TimeQuestion = {
  hhmm: string;
  german: string;
};

const times: TimeQuestion[] = generateTimeJson() as TimeQuestion[];

function getRandomTime(): TimeQuestion {
  return times[Math.floor(Math.random() * times.length)];
}

export default function TimeQuiz() {
  // Helper to convert 'hh:mm Uhr' to descriptive German
  function convertDigitsToGerman(input: string): string {
    const match = input.match(/(\d{1,2}):(\d{2}) ?uhr/i);
    if (!match) return input;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    // Use the same words as in generateTimeJson
    const hourWord = h in times ? times[h * 60].german.split(' ')[0] : '';
    const minWord = m in times ? times[m].german.split(' ')[2] : '';
    // Fallback to lookup arrays if available
    // If not, fallback to numbers
    return `${hourWord || match[1]} Uhr ${minWord || match[2]}`.trim();
  }
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState<TimeQuestion | null>(null);
  React.useEffect(() => {
    setCurrent(getRandomTime());
  }, []);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // Minimal type for SpeechRecognition event
  type SpeechRecognitionResultEvent = {
    results: Array<{ [key: number]: { transcript: string } }>;
  };

  // Voice input handler
  const handleVoice = () => {
    // @ts-expect-error SpeechRecognition is not typed in TypeScript DOM typings
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox");
    if (isFirefox) {
      setVoiceError("Voice input is only supported in Chrome or Edge.");
      return;
    }
    if (!SpeechRecognition) {
      setVoiceError("Voice input not supported in this browser.");
      return;
    }
    setVoiceError("");
    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      setAnswer(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const checkAnswer = () => {
    if (!current) return;
    // Accept both descriptive and digit-based answers
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedGerman = current.german.trim().toLowerCase();
    const converted = convertDigitsToGerman(normalizedAnswer).toLowerCase();
    const isCorrect =
      normalizedAnswer === normalizedGerman ||
      converted === normalizedGerman;
    setResult(isCorrect);
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setTimeout(() => {
        setCurrent(getRandomTime());
        setAnswer("");
        setResult(null);
        setVoiceError("");
      }, 1000); // Show 'Correct!' for 1 second before next question
    }
  };

  const nextQuestion = () => {
    setCurrent(getRandomTime());
    setAnswer("");
    setResult(null);
    setVoiceError("");
  };

  const skipQuestion = () => {
    setCurrent(getRandomTime());
    setAnswer("");
    setResult(null);
    setVoiceError("");
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-16">
      <h1 className="text-2xl font-bold">German Time Quiz</h1>
      <div className="text-lg font-semibold">Score: {score}</div>
      {!current ? (
        <div className="text-lg">Loading...</div>
      ) : (
        <>
          <div className="text-lg">
            What is <span className="font-mono">{current.hhmm}</span> in German?
          </div>
          <input
            className="border rounded px-3 py-2 text-lg"
            type="text"
            placeholder="Type your answer in German"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={listening}
          />
          <div className="flex gap-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={checkAnswer}
              disabled={result !== null}
            >
              Check Answer
            </button>
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              onClick={skipQuestion}
              disabled={listening}
            >
              Skip
            </button>
          </div>
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={handleVoice}
            disabled={listening || result !== null}
          >
            {listening ? "Listening..." : "Answer by Voice"}
          </button>
          {result !== null && (
            <div className={`text-lg font-semibold ${result ? "text-green-600" : "text-red-600"}`}>
              {result
                ? "Correct!"
                : `Incorrect. The correct answer is: "${current.german}"`}
            </div>
          )}
          {result !== null && (
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={nextQuestion}
              disabled={result === true}
            >
              Next Question
            </button>
          )}
        {voiceError && (
          <div className="mt-2 text-red-600 border border-red-400 bg-red-100 rounded px-4 py-2 text-sm">
            {voiceError}
          </div>
        )}
        </>
      )}
    </div>
  );
}

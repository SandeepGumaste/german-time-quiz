

"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { generateInformalTimeJson, generateTimeJson } from "@/lib/utils";

type TimeQuestion = {
  hhmm: string;
  german: string;
};

const times: TimeQuestion[] = generateTimeJson() as TimeQuestion[];

// function getRandomTime(): TimeQuestion {
//   return times[Math.floor(Math.random() * times.length)];
// }

export default function TimeQuiz() {
  React.useEffect(() => {
    if (!current) {
      setCurrent(getRandomTime());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [answerType, setAnswerType] = useState<'formal' | 'informal'>('formal');
  const [current, setCurrent] = useState<TimeQuestion | null>(null);
  const timesFormal: TimeQuestion[] = generateTimeJson() as TimeQuestion[];
  const timesInformal: TimeQuestion[] = generateInformalTimeJson() as TimeQuestion[];
  const getRandomTime = () => {
    const times = answerType === 'formal' ? timesFormal : timesInformal;
    return times[Math.floor(Math.random() * times.length)];
  };
  // Remove useEffect that updates current question on answerType change
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [listening, setListening] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceError, setVoiceError] = useState("");
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const recognitionRef = React.useRef<any>(null);

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
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => {
      setListening(true);
      setVoiceActive(true);
    };
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      // Concatenate all transcripts for continuous input
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setAnswer(transcript.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setVoiceActive(false);
  };

  const checkAnswer = () => {
    if (!current) return;
    // Accept both descriptive and digit-based answers
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedGerman = current.german.trim().toLowerCase();
    let isCorrect = false;
    if (answerType === 'formal') {
      const converted = convertDigitsToGerman(normalizedAnswer).toLowerCase();
      isCorrect = normalizedAnswer === normalizedGerman || converted === normalizedGerman;
    } else {
      isCorrect = normalizedAnswer === normalizedGerman;
    }
    setResult(isCorrect);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrong((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    setCurrent(getRandomTime());
    setAnswer("");
    setResult(null);
    setVoiceError("");
    setVoiceActive(false);
  };

  const skipQuestion = () => {
    setSkipped((prev) => prev + 1);
    setCurrent(getRandomTime());
    setAnswer("");
    setResult(null);
    setVoiceError("");
    setVoiceActive(false);
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-16">
      <h1 className="text-2xl font-bold">German Time Quiz</h1>
      <div className="text-lg font-semibold">
        Correct: {score} &nbsp;|
        Wrong: {wrong} &nbsp;|
        Skipped: {skipped}
      </div>
      {!current ? (
        <div className="text-lg">Loading...</div>
      ) : (
        <>
          <div className="text-lg">
            What is <span className="font-mono">{current.hhmm}</span> in German?
          </div>
          <div className="flex gap-4 mb-4">
            <label>
              <input
                type="radio"
                name="answerType"
                value="formal"
                checked={answerType === 'formal'}
                onChange={() => setAnswerType('formal')}
              /> Formal
            </label>
            <label>
              <input
                type="radio"
                name="answerType"
                value="informal"
                checked={answerType === 'informal'}
                onChange={() => setAnswerType('informal')}
              /> Informal
            </label>
          </div>
          <input
            className="border rounded px-3 py-2 text-lg"
            type="text"
            placeholder="Type your answer in German"
            value={answer}
            onChange={(e) => {
              const value = e.target.value;
              // Block input if it matches hh:mm Uhr format
              if (/^\d{1,2}:\d{2} ?uhr$/i.test(value.trim())) {
                return;
              }
              setAnswer(value);
            }}
            disabled={listening || voiceActive}
          />
                    {!listening && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              onClick={handleVoice}
              disabled={listening || result !== null}
            >
              <Mic size={20} />
              Answer by Voice
            </Button>
          )}
          {listening && (
            <Button
              variant="destructive"
              onClick={handleStopVoice}
            >
              Stop
            </Button>
          )}
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={checkAnswer}
              disabled={result !== null}
            >
              Check Answer
            </Button>
            <Button
              variant="secondary"
              onClick={skipQuestion}
              disabled={listening || result !== null}
            >
              Skip
            </Button>
          </div>

          {result !== null && (
            <div className={`text-lg font-semibold ${result ? "text-green-600" : "text-red-600"}`}>
              {result
                ? "Correct!"
                : `Incorrect. The correct answer is: "${current.german}"`}
            </div>
          )}
          {result === true && (
            <Button
              className="mt-4"
              variant="default"
              onClick={nextQuestion}
            >
              Next Question
            </Button>
          )}
          {result === false && (
            <Button
              className="mt-4"
              variant="default"
              onClick={nextQuestion}
            >
              Next Question
            </Button>
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

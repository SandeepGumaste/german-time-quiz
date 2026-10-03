

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Info } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateTimeJson, numToGermanWords } from "@/lib/utils";

type TimeQuestion = {
  hhmm: string;
  german: string[];
};

const times: TimeQuestion[] = generateTimeJson() as TimeQuestion[];

// function getRandomTime(): TimeQuestion {
//   return times[Math.floor(Math.random() * times.length)];
// }

export default function TimeQuiz() {
  const [open, setOpen] = useState(false);
  // Helper to convert 'hh:mm Uhr' to descriptive German
  function convertDigitsToGerman(input: string): string {
    const match = input.match(/(\d{1,2}):(\d{2}) ?uhr/i);
    if (!match) return input;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return numToGermanWords(h, m);
  }
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [current, setCurrent] = useState<TimeQuestion | null>(null);
  const getRandomTime = () => {
    return times[Math.floor(Math.random() * times.length)];
  };
  React.useEffect(() => {
    if (!current) {
      // Picked on the client after mount so server and client markup match.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(getRandomTime());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
    // recognition.maxAlternatives = 5;
    recognition.onstart = () => {
      setListening(true);
      setVoiceActive(true);
    };
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      // Concatenate all transcripts for continuous input (best alternative)
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      let normalized = transcript.trim();
      // Remove spaces before or after ':'
      normalized = normalized.replace(/\s*:\s*/g, ':');
      // Replace all occurrences of 'hh:30' (optionally with ' Uhr') with 'halb' + next hour (12-hour format)
      normalized = normalized.replace(/(\d{1,2}):30(?: ?uhr)?/gi, (match, h) => {
        let hour = parseInt(h, 10) + 1;
        if (hour > 12) hour = hour - 12;
        let halbWord = numToGermanWords(hour, 0).replace(' Uhr null', '');
        // Special case: 00:30 should be 'halb eins' (not 'halb ein')
        if (parseInt(h, 10) === 0 || parseInt(h, 10) === 24) {
          halbWord = 'eins';
        }
        return `halb ${halbWord}`;
      });
      // 1. '8:20', '8 20', '12:30 Uhr' => 'acht Uhr zwanzig', 'zwölf Uhr dreißig'
      let match = normalized.match(/^(\d{1,2})[ :](\d{2})(?: ?uhr)?$/i);
      if (match) {
        const h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        normalized = numToGermanWords(h, m);
      } else {
        // 2. '20 nach 8' => 'zwanzig nach acht'
        match = normalized.match(/^(\d{1,2}) ?nach ?(\d{1,2})$/i);
        if (match) {
          const m = parseInt(match[1], 10);
          const h = parseInt(match[2], 10);
          normalized = `${numToGermanWords(m, 0).replace(' Uhr null', '')} nach ${numToGermanWords(h, 0).replace(' Uhr null', '')}`;
        } else {
          // 3. '20 vor 9' => 'zwanzig vor neun'
          match = normalized.match(/^(\d{1,2}) ?vor ?(\d{1,2})$/i);
          if (match) {
            const m = parseInt(match[1], 10);
            const h = parseInt(match[2], 10);
            normalized = `${numToGermanWords(m, 0).replace(' Uhr null', '')} vor ${numToGermanWords(h, 0).replace(' Uhr null', '')}`;
          } else {
            // 4. '5 nach halb 9' => 'fünf nach halb neun'
            match = normalized.match(/^(\d{1,2}) ?nach halb ?(\d{1,2})$/i);
            if (match) {
              const m = parseInt(match[1], 10);
              const h = parseInt(match[2], 10);
              normalized = `${numToGermanWords(m, 0).replace(' Uhr null', '')} nach halb ${numToGermanWords(h, 0).replace(' Uhr null', '')}`;
            } else {
              // 5. '5 vor halb 9', '11 vor halb 10', etc. => normalize all digit-based forms to words
              match = normalized.match(/^(\d{1,2}) ?vor halb ?(\d{1,2})$/i);
              if (match) {
                const m = parseInt(match[1], 10);
                const h = parseInt(match[2], 10);
                normalized = `${numToGermanWords(m, 0).replace(' Uhr null', '')} vor halb ${numToGermanWords(h, 0).replace(' Uhr null', '')}`;
              } else {
                // 6. '11 nach 10:30' => 'elf nach halb elf'
                match = normalized.match(/^(\d{1,2}) ?nach ?(\d{1,2}):30$/i);
                if (match) {
                  const m = parseInt(match[1], 10);
                  let h = parseInt(match[2], 10) + 1; // halb refers to next hour
                  if (h > 12) h = h - 12;
                  normalized = `${numToGermanWords(m, 0).replace(' Uhr null', '')} nach halb ${numToGermanWords(h, 0).replace(' Uhr null', '')}`;
                }
              }
            }
          }
        }
      }
      setAnswer(normalized);
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
    const converted = convertDigitsToGerman(normalizedAnswer).toLowerCase();
    const isCorrect = current.german.some(
      (form) => normalizedAnswer === form.trim().toLowerCase() || converted === form.trim().toLowerCase()
    );
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
    <div className="flex flex-col items-center gap-8 mt-16 relative">
      <Link href="/" className="absolute -top-10 left-4 text-sm underline text-gray-600">← All games</Link>
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

          <input
            className="border rounded px-3 py-2 text-lg bg-gray-100 cursor-not-allowed opacity-60"
            type="text"
            placeholder="Answer by voice only"
            value={answer}
            disabled
            readOnly
            tabIndex={-1}
            aria-disabled="true"
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
              className="flex items-center gap-2"
            >
              <MicOff size={20} />
              Stop
            </Button>
          )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="How to use"
            className="fixed bottom-6 right-6 z-50 bg-red-600 border-none rounded-full shadow-lg p-3 hover:bg-red-700"
            onClick={() => setOpen(true)}
          >
            <Info size={28} className="text-white" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to use the German Time Quiz</DialogTitle>
            <DialogDescription asChild>
              <div>
                <ul className="list-disc pl-5 space-y-2 text-left">
                  <li>Type your answer in German or use the green <Mic className="inline" size={18} /> <b>Answer by Voice</b> button.</li>
                  <li>Click <b>Check Answer</b> to see if your answer is correct.</li>
                  <li>If you don&apos;t know the answer, click <b>Skip</b> to move to the next question (this will count as skipped).</li>
                  <li>After checking your answer, click <b>Next Question</b> to continue.</li>
                  <li>Your <b>Correct</b>, <b>Wrong</b>, and <b>Skipped</b> scores are shown at the top.</li>
                  <li>Use the <MicOff className="inline" size={18} /> <b>Stop</b> button to stop voice input.</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
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
              {result ? "Correct!" : "Incorrect. The correct answers are:"}
              <>
                <div className="text-base font-normal mt-2 mb-1">
                  {current.german.length} possible correct ways:
                </div>
                <ul className="list-disc pl-5">
                  {current.german.map((form, idx) => (
                    <li key={idx}>{form}</li>
                  ))}
                </ul>
              </>
            </div>
          )}
          {(result === true || result === false) && (
            <div className="flex gap-4 mt-4">
              <Button
                variant="default"
                onClick={nextQuestion}
              >
                Next Question
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAnswer("");
                  setResult(null);
                  setVoiceError("");
                  setVoiceActive(false);
                }}
              >
                Try Again
              </Button>
            </div>
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

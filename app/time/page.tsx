

"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Info } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateTimeJson, numToGermanWords } from "@/lib/utils";
import { normalizeSpokenTime } from "@/lib/spoken-time";
import { ExplainButton } from "@/components/explain-button";
import { startRecording, type Recording } from "@/lib/record-audio";
import { reportRound } from "@/lib/report-round";

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
  const { data: session } = useSession();
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [serverVoiceDown, setServerVoiceDown] = useState(false);
  const [serverVoiceReady, setServerVoiceReady] = useState(false); // false until the server confirms it is set up
  const [voiceError, setVoiceError] = useState("");
  // This game has no round end, so answers are reported in batches: every 10 answers, when the
  // tab is hidden, and when leaving the page. Skips are not counted as answers.
  const reported = React.useRef<{ correct: number; total: number; at: number } | null>(null);
  const flush = React.useCallback(() => {
    const now = Date.now();
    const last = reported.current ?? { correct: 0, total: 0, at: now };
    const total = score + wrong;
    if (total - last.total <= 0) return;
    reportRound({
      game: "time", mode: "practice", correct: score - last.correct, total: total - last.total,
      xp: 0, bestStreak: 0, level: 1, misses: [], durationSec: Math.min(3600, (now - last.at) / 1000),
    });
    reported.current = { correct: score, total, at: now };
  }, [score, wrong]);
  const flushRef = React.useRef(flush);
  React.useEffect(() => {
    flushRef.current = flush;
    if (reported.current === null) reported.current = { correct: 0, total: 0, at: Date.now() };
    if ((score + wrong) > 0 && (score + wrong) % 10 === 0) flush();
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [flush, score, wrong]);
  React.useEffect(() => () => flushRef.current(), []);
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const recognitionRef = React.useRef<any>(null);

  // Minimal type for SpeechRecognition event
  type SpeechRecognitionResultEvent = {
    results: Array<{ [key: number]: { transcript: string } }>;
  };

  // Voice input handler
  const handleBrowserVoice = () => {
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
    };
    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      // Concatenate all transcripts for continuous input (best alternative)
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      const normalized = normalizeSpokenTime(transcript);
      setAnswer(normalized);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const recordingRef = React.useRef<Recording | null>(null);

  // Signed-in players are recorded and sent to our server for transcription, which works in every browser.
  const handleServerVoice = async () => {
    setVoiceError("");
    try {
      const recording = await startRecording();
      recordingRef.current = recording;
      setListening(true);
      const blob = await recording.result; // resolves on Stop, or by itself after a few seconds
      recordingRef.current = null;
      setListening(false);
      setTranscribing(true);
      const res = await fetch("/api/transcribe", { method: "POST", headers: { "Content-Type": blob.type }, body: blob });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Once server voice recognition is out of reach (daily limit used up, or the service is down), use the browser's own recognition.
        if (res.status === 429 || res.status === 502 || res.status === 503) {
          setServerVoiceDown(true);
          throw new Error(
            res.status === 429
              ? "You've used today's enhanced voice answers. Press Answer by Voice again to use your browser's voice recognition instead."
              : "Voice service unavailable. Press Answer by Voice again to use your browser's voice recognition instead."
          );
        }
        throw new Error(data.error ?? "Voice recognition failed.");
      }
      if (!data.transcript) throw new Error("Didn't catch that. Try again.");
      setAnswer(normalizeSpokenTime(data.transcript));
    } catch (e) {
      setListening(false);
      setVoiceError(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow it in your browser and try again."
          : e instanceof Error ? e.message : "Voice recognition failed."
      );
    } finally {
      setTranscribing(false);
    }
  };

  // Without a server key (or when signed out) the browser's own recognition is used.
  const signedIn = Boolean(session?.user);
  const useServerVoice = signedIn && serverVoiceReady && !serverVoiceDown;
  const handleVoice = () => (useServerVoice ? handleServerVoice() : handleBrowserVoice());

  React.useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetch("/api/transcribe")
      .then((r) => r.json())
      .then((d) => !cancelled && setServerVoiceReady(d.enabled === true))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const handleStopVoice = () => {
    recordingRef.current?.stop();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
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
  };

  const skipQuestion = () => {
    setSkipped((prev) => prev + 1);
    setCurrent(getRandomTime());
    setAnswer("");
    setResult(null);
    setVoiceError("");
  };

  return (
    <div className="flex flex-col items-center gap-8 mt-16 relative">
      <Link href="/" className="absolute -top-10 left-4 text-sm underline text-muted-foreground">← All games</Link>
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
            className="border-2 border-ink rounded px-3 py-2 text-lg bg-muted cursor-not-allowed opacity-60"
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
              className="bg-success text-white flex items-center gap-2"
              onClick={handleVoice}
              disabled={listening || transcribing || result !== null}
            >
              <Mic size={20} />
              {transcribing ? "Transcribing…" : "Answer by Voice"}
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
            className="fixed bottom-6 right-6 z-50 bg-primary border-[3px] border-ink rounded shadow-arcade p-3 hover:bg-primary/90 active:translate-x-1 active:translate-y-1 active:shadow-none"
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
            <div className={`text-lg font-semibold ${result ? "text-success" : "text-primary"}`}>
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
                }}
              >
                Try Again
              </Button>
            </div>
          )}
          {result === false && <ExplainButton key={current.hhmm} request={{ game: "time", hhmm: current.hhmm }} />}
        {voiceError && (
          <div className="mt-2 text-primary border-2 border-ink bg-danger-soft rounded px-4 py-2 text-sm">
            {voiceError}
          </div>
        )}
        </>
      )}
    </div>
  );
}

// Converts numeric hour/minute to German words, e.g. 3, 15 -> 'drei Uhr fünfzehn'
export function numToGermanWords(h: number, m: number): string {
  // Use 'ein' for hour 1, but 'eins' for minute 1
  const hourWord = h === 1 ? 'ein' : numWords[h];
  const minWord = numWords[m];
  return `${hourWord} Uhr ${minWord}`;
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const hours = [
  "null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun",
  "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn",
  "achtzehn", "neunzehn", "zwanzig", "einundzwanzig", "zweiundzwanzig", "dreiundzwanzig"
];

const numWords: { [key: number]: string } = {
  0: "null", 1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf", 6: "sechs", 7: "sieben", 8: "acht", 9: "neun",
  10: "zehn", 11: "elf", 12: "zwölf", 13: "dreizehn", 14: "vierzehn", 15: "fünfzehn", 16: "sechzehn", 17: "siebzehn",
  18: "achtzehn", 19: "neunzehn", 20: "zwanzig", 21: "einundzwanzig", 22: "zweiundzwanzig", 23: "dreiundzwanzig",
  24: "vierundzwanzig", 25: "fünfundzwanzig", 26: "sechsundzwanzig", 27: "siebenundzwanzig", 28: "achtundzwanzig",
  29: "neunundzwanzig", 30: "dreißig", 31: "einunddreißig", 32: "zweiunddreißig", 33: "dreiunddreißig",
  34: "vierunddreißig", 35: "fünfunddreißig", 36: "sechsunddreißig", 37: "siebenunddreißig", 38: "achtunddreißig",
  39: "neununddreißig", 40: "vierzig", 41: "einundvierzig", 42: "zweiundvierzig", 43: "dreiundvierzig",
  44: "vierundvierzig", 45: "fünfundvierzig", 46: "sechsundvierzig", 47: "siebenundvierzig", 48: "achtundvierzig",
  49: "neunundvierzig", 50: "fünfzig", 51: "einundfünfzig", 52: "zweiundfünfzig", 53: "dreiundfünfzig",
  54: "vierundfünfzig", 55: "fünfundfünfzig", 56: "sechsundfünfzig", 57: "siebenundfünfzig", 58: "achtundfünfzig",
  59: "neunundfünfzig"
};

export const generateTimeJson = () => {
  const result: { hhmm: string; german: string[] }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m++) {
      const hourStr = h.toString().padStart(2, '0');
      const minStr = m.toString().padStart(2, '0');
      const timeStr = `${hourStr}:${minStr}`;
      const nextHour = (h + 1) % 24;
      const forms: string[] = [];

      // 1. Formal/Digital: "hour Uhr minute"
      if (m === 0) {
        // 7. "Uhr" without minutes (on the hour)
        if (h === 0) {
          forms.push("null Uhr", "Mitternacht");
        } else if (h === 12) {
          forms.push("zwölf Uhr", "Mittag");
        } else {
          forms.push(`${hours[h]} Uhr`);
        }
      }
      forms.push(`${hours[h]} Uhr ${numWords[m]}`);


      // 2. "nach" (past): "minute nach hour"
      if (m > 0 && m < 30) {
        forms.push(`${numWords[m]} nach ${numWords[h]}`);
      }

      // 3. "vor" (to): "minute vor nextHour"
      if (m > 30 && m < 60) {
        forms.push(`${numWords[60 - m]} vor ${numWords[nextHour]}`);
      }

      // Helper for 12-hour clock hour
      const hour12 = (h: number) => {
        let hr = h % 12;
        if (hr === 0) hr = 12;
        return numWords[hr];
      };

      // 4. "halb" (half to next hour) - use 12-hour clock
      if (m === 30) {
        forms.push(`halb ${hour12(nextHour)}`);
      }

      // 5. Minutes before/after half - use 12-hour clock
      if (m > 0 && m < 30) {
        forms.push(`${numWords[30 - m]} vor halb ${hour12(nextHour)}`); // e.g. 09:14 -> sechzehn vor halb zehn
      }
      if (m > 30 && m < 60) {
        forms.push(`${numWords[m - 30]} nach halb ${hour12(nextHour)}`); // e.g. 09:34 -> vier nach halb zehn
      }

      // 6. Quartal expressions
      if (m === 15) {
        forms.push(`viertel nach ${hours[h]}`);
      }
      if (m === 45) {
        forms.push(`viertel vor ${hours[nextHour]}`);
        forms.push(`dreiviertel ${hours[nextHour]}`); // regional
      }

      // Remove duplicates
      const uniqueForms = Array.from(new Set(forms));
      result.push({ hhmm: timeStr, german: uniqueForms });
    }
  }
  return result;
}

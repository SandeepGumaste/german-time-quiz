import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


const hours = [
  "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun",
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
  const result: { hhmm: string; german: string }[] = [];
  for(let h = 0; h < 24; h++) {
    for(let m = 0; m < 60; m++) {
      const hourStr = h.toString().padStart(2, '0');
      const minStr = m.toString().padStart(2, '0');
      const timeStr = `${hourStr}:${minStr}`;
      const german = `${hours[h]} Uhr ${numWords[m]}`;
      result.push({ hhmm: timeStr, german });
    }
  }
  return result;
}

// Informal German time expressions (e.g., "viertel nach drei", "halb vier")
export const generateInformalTimeJson = () => {
  const result: { hhmm: string; german: string }[] = [];
  for(let h = 0; h < 24; h++) {
    for(let m = 0; m < 60; m++) {
      const hourStr = h.toString().padStart(2, '0');
      const minStr = m.toString().padStart(2, '0');
      const timeStr = `${hourStr}:${minStr}`;
      const nextHour = (h + 1) % 24;
      let informal = "";
      if (m === 0) {
        informal = `${hours[h]} Uhr`;
      } else if (m === 15) {
        informal = `Viertel nach ${hours[h]}`;
      } else if (m === 30) {
        informal = `Halb ${hours[nextHour]}`;
      } else if (m === 45) {
        informal = `Viertel vor ${hours[nextHour]}`;
      } else if (m < 30) {
        informal = `${numWords[m]} nach ${hours[h]}`;
      } else {
        informal = `${numWords[60 - m]} vor ${hours[nextHour]}`;
      }
      result.push({ hhmm: timeStr, german: informal });
    }
  }
  return result;
}

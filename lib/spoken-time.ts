import { numToGermanWords } from "./utils";

// Turns a spoken or recognised time into the wording the quiz accepts ("8:20" becomes "acht Uhr zwanzig", and so on).
export function normalizeSpokenTime(raw: string): string {
  let normalized = raw.trim();
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
  return normalized;
}

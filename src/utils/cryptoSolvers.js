/**
 * Core Solvers for CryptoKiller 
 * Modular and highly efficient.
 */

// Simple Base64
export const decodeBase64 = (str) => {
  try {
    return atob(str);
  } catch (e) {
    return null;
  }
};

// Hex to Text
export const decodeHex = (hex) => {
  try {
    const cleanHex = hex.replace(/\s+/g, '');
    let str = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
    }
    return str;
  } catch (e) {
    return null;
  }
};

// Binary to Text
export const decodeBinary = (bin) => {
  try {
    const cleanBin = bin.replace(/\s+/g, '');
    let str = '';
    for (let i = 0; i < cleanBin.length; i += 8) {
      str += String.fromCharCode(parseInt(cleanBin.substr(i, 8), 2));
    }
    return str;
  } catch (e) {
    return null;
  }
};

// Caesar Cipher Solver
export const solveCaesar = (text, shift) => {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
    }
    return char;
  }).join('');
};

// Brute Force Caesar All 26 Shifts
export const bruteCaesar = (text) => {
  const results = [];
  for (let i = 0; i < 26; i++) {
    results.push({ shift: i, result: solveCaesar(text, i) });
  }
  return results;
};

// Atbash Solver
export const solveAtbash = (text) => {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));
    if (code >= 97 && code <= 122) return String.fromCharCode(122 - (code - 97));
    return char;
  }).join('');
};

// Auto-Detect Suggestion Logic
export const autoDetect = (text) => {
  if (!text) return [];
  const suggestions = [];

  // Check if it looks like Base64
  if (/^[A-Za-z0-9+/=]+$/.test(text) && text.length % 4 === 0) {
    const decoded = decodeBase64(text);
    if (decoded && /[A-Za-z0-9]/.test(decoded)) {
      suggestions.push({ type: 'Base64', result: decoded });
    }
  }

  // Check if it looks like Hex
  if (/^[0-9a-fA-F\s]+$/.test(text)) {
    const decoded = decodeHex(text);
    if (decoded && /[A-Za-z0-9]/.test(decoded)) {
        suggestions.push({ type: 'Hex', result: decoded });
    }
  }

  // Check if it looks like Binary
  if (/^[01\s]+$/.test(text)) {
    const decoded = decodeBinary(text);
    if (decoded && /[A-Za-z0-9]/.test(decoded)) {
        suggestions.push({ type: 'Binary', result: decoded });
    }
  }

  // Check for common prefix "flag{" or "CTF{"
  if (text.toLowerCase().includes('flag') || text.toLowerCase().includes('ctf')) {
      suggestions.push({ type: 'Detected flag prefix!', result: 'Potential flag found.' });
  }

  // XOR Brute Force Check (Single Byte)
  // We'll perform a quick brute for common flag patterns
  const flagPrefixes = ['flag{', 'CTF{', 'picoCTF{'];
  const hexBytes = text.match(/[0-9a-fA-F]{2}/g);
  if (hexBytes) {
      const bytes = hexBytes.map(h => parseInt(h, 16));
      for (let k = 0; k < 256; k++) {
          const xored = bytes.map(b => String.fromCharCode(b ^ k)).join('');
          if (flagPrefixes.some(p => xored.toLowerCase().includes(p.toLowerCase()))) {
              suggestions.push({ type: 'XOR (Key 0x' + k.toString(16) + ')', result: xored });
          }
      }
  }

  return suggestions;
};

// Full Single-Byte XOR Brute
export const bruteXOR = (text) => {
    const hexBytes = text.match(/[0-9a-fA-F]{2}/g);
    if (!hexBytes) return [];
    const bytes = hexBytes.map(h => parseInt(h, 16));
    const results = [];
    for (let k = 0; k < 256; k++) {
        results.push({ key: '0x' + k.toString(16), result: bytes.map(b => b ^ k).map(b => String.fromCharCode(b)).join('') });
    }
    return results;
};

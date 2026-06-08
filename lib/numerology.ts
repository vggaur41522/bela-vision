export type Gender = 'male' | 'female';

export function reduceToSingleDigit(num: number): number {
  if (num === 0) return 0;
  if (num % 9 === 0) return 9;
  return num % 9;
}

export function calculateDriver(dob: string): number {
  // dob is DD-MM-YYYY
  const parts = dob.split('-');
  if (parts.length !== 3) return 0;
  const day = parts[0];
  let sum = 0;
  for (const char of day) {
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    }
  }
  return reduceToSingleDigit(sum);
}

export function calculateConductor(dob: string): number {
  let sum = 0;
  for (const char of dob) {
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    }
  }
  return reduceToSingleDigit(sum);
}

export function calculateKua(dob: string, gender: Gender): number {
  const parts = dob.split('-');
  if (parts.length !== 3) return 0;
  const year = parts[2];
  let sum = 0;
  for (const char of year) {
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    }
  }
  
  let yearReduced = reduceToSingleDigit(sum);
  if (gender === 'male') {
    let kua = 11 - yearReduced;
    return reduceToSingleDigit(kua);
  } else {
    let kua = 4 + yearReduced;
    return reduceToSingleDigit(kua);
  }
}

const chaldeanValues: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8
};

export function calculateNameNumber(name: string): number {
  let sum = 0;
  for (const char of name.toLowerCase()) {
    if (chaldeanValues[char]) {
      sum += chaldeanValues[char];
    }
  }
  return reduceToSingleDigit(sum);
}

export type NumerologyCalculation = {
  kuaNumber: number;
  driverNumber: number;
  conductorNumber: number;
  nameNumber: number;
  counts: Record<number, number>;
};

export function calculateNumerology(name: string, dob: string, gender: Gender): NumerologyCalculation {
  const driverNumber = calculateDriver(dob);
  const conductorNumber = calculateConductor(dob);
  const kuaNumber = calculateKua(dob, gender);
  const nameNumber = calculateNameNumber(name);

  const counts: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  // Add DOB digits
  for (const char of dob) {
    if (char >= '1' && char <= '9') {
      counts[parseInt(char, 10)]++;
    }
  }

  // Add driver, conductor, kua
  if (driverNumber > 0) counts[driverNumber]++;
  if (conductorNumber > 0) counts[conductorNumber]++;
  if (kuaNumber > 0) counts[kuaNumber]++;
  
  return {
    kuaNumber,
    driverNumber,
    conductorNumber,
    nameNumber,
    counts
  };
}

export const encodingMap = {
  0: { binary: "01010", value: 0 },
  1: { binary: "10100", value: 1 },
  2: { binary: "01001", value: 2 },
  3: { binary: "01000", value: 3 },
  4: { binary: "10010", value: 4 },
  5: { binary: "01100", value: 5 },
  6: { binary: "10001", value: 6 },
  7: { binary: "10000", value: 7 },
  8: { binary: "00101", value: 8 },
  9: { binary: "00100", value: 9 },
  K: { binary: "00110", value: 10 },
  L: { binary: "11000", value: 11 },
  M: { binary: "00010", value: 12 },
  O: { binary: "00001", value: 14 },
  START: { binary: "00000", value: 13 },
  STOP: { binary: "00011", value: 15 },
};

export const decodingMap = {
  "01010": { char: 0, value: 0 },
  10100: { char: 1, value: 1 },
  "01001": { char: 2, value: 2 },
  "01000": { char: 3, value: 3 },
  10010: { char: 4, value: 4 },
  "01100": { char: 5, value: 5 },
  10001: { char: 6, value: 6 },
  10000: { char: 7, value: 7 },
  "00101": { char: 8, value: 8 },
  "00100": { char: 9, value: 9 },
  "00110": { char: "K", value: 10 },
  11000: { char: "L", value: 11 },
  "00010": { char: "M", value: 12 },
  "00001": { char: "O", value: 14 },
  "00000": { char: "START", value: 13 },
  "00011": { char: "STOP", value: 15 },
};

export function computeControlSymbol(encodedInformationSymbols) {
  // [1, 2, M, O, 3, 4, ...]
  const weights = encodedInformationSymbols.map((symbol, index) => {
    const position = index + 1;
    const positionIsEven = position % 2 === 0;
    return positionIsEven ? 2 : 1;
  });

  let productsSum = 0;
  for (let i = 0; i < encodedInformationSymbols.length; i++) {
    const value = encodedInformationSymbols[i].value;
    const product = value * weights[i];
    const digits = product.toString().split("").map(Number);
    const digitsSum = digits.reduce((acum, nextDigit) => acum + nextDigit);
    productsSum += digitsSum;
  }
  const controlSum = 10 - (productsSum % 10);
  const controlSymbol = controlSum < 10 ? controlSum : "K"; // "K" when sum is 10 (for example, 20 - 10)
  return controlSymbol;
}

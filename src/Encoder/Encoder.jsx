import "./Encoder.css";
import { useState } from "react";
import { encodingMap, computeControlSymbol } from "../code-decode.jsx";

export default function Encoder() {
  const [info, setInfo] = useState("");
  const informationSymbols = info.split("");

  const handleInfoInputChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length > info.length) {
      const newSymbol = newValue.at(-1);
      if (!(newSymbol in encodingMap)) return;
    }
    setInfo(newValue);
  };

  const svgImage = svgFromDDistanceSymbols(
    informationSymbols,
    encodingMap,
    1000
  );

  return (
    <>
      <p>Please, enter a valid information string you need to encode</p>
      <p>
        "Delta Distance" possible symbols: [
        <span className="supported-symbols">0-9,K,L,M,O</span>]
      </p>
      <form>
        <label>
          <input
            type="text"
            placeholder="12345MO..."
            className="encoding-input"
            value={info}
            onChange={handleInfoInputChange}
            required
          ></input>
        </label>
      </form>
      <div className="generated-image">{svgImage}</div>
    </>
  );
}

function chunkFromSymbol(x, encodedSymbol, baseNarrowWidth) {
  // symbolChunk is a single svg fragment
  const digits = encodedSymbol.binary.split("");
  const chunkRects = [];
  for (const digit of digits) {
    const precedingBar = bar(x, baseNarrowWidth);
    x += baseNarrowWidth;

    const narrowSpaces = space(x, digit, baseNarrowWidth);
    x += baseNarrowWidth * narrowSpaces.length;

    chunkRects.push(precedingBar, ...narrowSpaces);
  }

  const endingBar = bar(x, baseNarrowWidth);
  x += baseNarrowWidth;
  chunkRects.push(endingBar);

  const chunk = (
    <g key={`symbol-${encodedSymbol.binary}-ends-${x}`} className="symbol">
      {chunkRects}
    </g>
  );

  return { chunk, nextX: x };
}

function bar(x, baseNarrowWidth) {
  const bar = (
    <rect
      x={x}
      width={baseNarrowWidth}
      height="100%"
      key={`x-position-${x}`}
      fill="black"
    />
  );
  return bar;
}

function space(x, digit, baseNarrowWidth) {
  const spaces = [];
  const spaceCount = digit === "0" ? 1 : 3;
  for (let i = 0; i < spaceCount; i++) {
    spaces.push(
      <rect
        x={x}
        width={baseNarrowWidth}
        height="100%"
        key={`x-position-${x}`}
        fill="white"
      />
    );
    x += baseNarrowWidth;
  }
  return spaces;
}

function delimiter(x, baseNarrowWidth, narrowDelimiterCount, delimiterKey) {
  const delimitingRects = [];
  for (let i = 0; i < narrowDelimiterCount; i++, x += baseNarrowWidth) {
    delimitingRects.push(
      <rect
        x={x}
        width={baseNarrowWidth}
        height="100%"
        fill="white"
        key={`x-position-${x}`}
      />
    );
  }
  return (
    <g key={delimiterKey} className="delimiter">
      {delimitingRects}
    </g>
  );
}

function svgFromDDistanceSymbols(
  informationSymbols,
  encodingMap,
  svgContainerWidth
) {
  const svgHeight = 200;
  const narrowBarsPerSymbol = 6;
  const narrowDelimiterCount = 3;

  const encodedInformationSymbols = informationSymbols.map(
    (symbol) => encodingMap[symbol]
  );

  const encodedSymbols = [
    encodingMap["START"],
    ...encodedInformationSymbols,
    encodingMap[computeControlSymbol(encodedInformationSymbols)],
    encodingMap["STOP"],
  ];

  console.log(encodedSymbols);

  const expectedNarrowCount = encodedSymbols.reduce(
    (sum, encodedSymbol, index) => {
      const narrowSpaceCount = encodedSymbol.binary
        .split("")
        .reduce((count, digit) => {
          if (digit === "0") return (count += 1);
          return (count += 3);
        }, 0);
      sum += narrowBarsPerSymbol + narrowSpaceCount;
      if (index < encodedSymbols.length - 1) sum += narrowDelimiterCount;
      return sum;
    },
    0
  );

  let baseNarrowWidth = Math.floor(svgContainerWidth / expectedNarrowCount);
  while (baseNarrowWidth <= 0) {
    svgContainerWidth *= 2;
    baseNarrowWidth = Math.floor(svgContainerWidth / expectedNarrowCount);
  }
  console.log({
    expectedCount: expectedNarrowCount,
    baseNarrowWidth,
    svgContainerWidth,
  });

  let currentX = 0;
  let delimiterCounter = 0;
  const chunks = encodedSymbols.reduce((gChunks, encodedSymbol, index) => {
    const { chunk, nextX } = chunkFromSymbol(
      currentX,
      encodedSymbol,
      baseNarrowWidth
    );
    currentX = nextX;
    gChunks.push(chunk);

    if (index < encodedSymbols.length - 1) {
      const delimiterG = delimiter(
        currentX,
        baseNarrowWidth,
        narrowDelimiterCount,
        `delimiter-${delimiterCounter++}`
      );
      currentX += baseNarrowWidth * narrowDelimiterCount;

      gChunks.push(delimiterG);
    }

    return gChunks;
  }, []);

  return (
    <svg
      version="1.1"
      baseProfile="full"
      width={currentX} // it is needed to constraint the scaling when input is long (the image will "zoom out")
      height={svgHeight}
      stroke="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {chunks}
    </svg>
  );
}

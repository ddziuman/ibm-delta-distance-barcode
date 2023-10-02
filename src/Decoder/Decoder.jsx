import "./Decoder.css";
import { PNG } from "pngjs/browser";
import { decodingMap, computeControlSymbol } from "../code-decode.jsx";
import { useState } from "react";

function rgbaFromPx(px) {
  return `rgba(${px.r}, ${px.g}, ${px.b}, ${px.a})`;
}

function pixelsFromColorData(firstRow) {
  const rowPixels = firstRow.reduce((pixels, nextChannelValue, index) => {
    if ((index + 1) % 4 === 0) {
      pixels.push({
        r: firstRow[index - 3],
        g: firstRow[index - 2],
        b: firstRow[index - 1],
        a: firstRow[index],
      });
    }
    return pixels;
  }, []);
  return rowPixels;
}

function skipStartingSymbol(currentX, rowPixels, spacesInSymbol, barsInSymbol) {
  const barColor = rgbaFromPx(rowPixels[0]); // expecting: black [rgba(0, 0, 0, 255)]
  let barWidth = 0;
  while (rgbaFromPx(rowPixels[currentX]) === barColor) {
    // skipping the first bar
    barWidth++;
    currentX++;
  }
  const spaceColor = rgbaFromPx(rowPixels[currentX]); // expecting: white / transparent
  currentX =
    currentX + barWidth * (barsInSymbol - 1) + barWidth * spacesInSymbol;

  return {
    barWidth,
    spaceColor,
    nextX: currentX,
  };
}

function decodeInformationSymbols(colorData, width, height) {
  const firstRow = colorData.slice(0, width * 4); // 4 because [(r,g,b,a),(r,g,b,a), ...]
  const firstRowPixels = pixelsFromColorData(firstRow); // [{ r:val, g:val, b:val, a:val }, {...}, ...]
  let currentX = 0;
  const spacesInSymbol = 5; // expected, DDistance rules
  const barsInSymbol = 6; // expected, DDistance rules

  // get info from 1 symbol
  // parse every symbol
  const { barWidth, spaceColor, nextX } = skipStartingSymbol(
    currentX,
    firstRowPixels,
    spacesInSymbol,
    barsInSymbol
  );
  currentX = nextX;
  const narrowSpaceWidth = barWidth;
  const wideSpaceWidth = barWidth * 3;
  const spaceDigits = {
    [narrowSpaceWidth]: "0",
    [wideSpaceWidth]: "1",
  };
  // let's count the dilimiter spacing:
  let delimiterSpaceWidth = 0;
  while (rgbaFromPx(firstRowPixels[currentX]) === spaceColor) {
    delimiterSpaceWidth++;
    currentX++;
  }
  // start iterating everything else:
  const symbolsBinaries = ["00000"];

  while (currentX < width) {
    const currentSymbolDigits = [];
    for (let i = 0; i < spacesInSymbol; i++) {
      currentX += barWidth; // skiping bar before next digit '0' / '1'
      const spaceBeginX = currentX;
      if (currentX >= width)
        return {
          informationString: "<image is not a barcode>",
          sumIsCorrect: "failed",
        };
      while (rgbaFromPx(firstRowPixels[currentX]) === spaceColor) currentX++;
      const spaceWidth = currentX - spaceBeginX;
      currentSymbolDigits.push(spaceDigits[spaceWidth]);
    }
    symbolsBinaries.push(currentSymbolDigits.join(""));
    currentX += barWidth + delimiterSpaceWidth; // skipping the last bar after last digit '0'/'1' and delimiter space
  }
  const decodedSymbols = symbolsBinaries.map((binary) => decodingMap[binary]);
  const informationSymbols = decodedSymbols.slice(1, decodedSymbols.length - 2);
  const actualControlSymbol = decodedSymbols[decodedSymbols.length - 2].char;
  const computedControlSymbol = computeControlSymbol(informationSymbols);
  const sumIsCorrect =
    actualControlSymbol === computedControlSymbol ? "succeed" : "failed";
  const informationString = informationSymbols
    .map((symbol) => symbol.char)
    .join("");
  console.dir({
    informationString,
    actualControlSymbol,
    computedControlSymbol,
    sumIsCorrect,
  });
  return { informationString, sumIsCorrect };
}

export default function Decoder() {
  const [decodedInformation, setDecodedInformation] = useState({
    data: "<NO FILE SELECTED>",
    valid: "<NO FILE SELECTED>",
  });
  const handlePngUpload = async (e) => {
    const imageBuffer = await e.target.files[0].arrayBuffer();
    const decodedPNG = new PNG().parse(
      imageBuffer,
      (err, { data: colorData, width, height }) => {
        if (err) console.error(err);
        const { informationString, sumIsCorrect } = decodeInformationSymbols(
          colorData,
          width,
          height
        );

        setDecodedInformation({
          data: informationString,
          valid: sumIsCorrect,
        });
      }
    );
  };

  return (
    <>
      <p>
        Please, upload a valid ΔIBM SVG image you need to decode
        <br />
        (currently supporting only <strong>self-generated images</strong>)
      </p>
      <p>
        Supported decoding image formats: [
        <span className="supported-symbols">.png</span>]
      </p>
      <form>
        <label>
          <input
            type="file"
            className="encoding-input"
            accept=".png"
            onChange={handlePngUpload}
            required
          ></input>
        </label>
      </form>
      <dl>
        <dt>Decoded sequence: </dt>
        <dd className={`decode-${decodedInformation.valid}`}>
          {decodedInformation.data}
        </dd>
        <dt>Checksum Verification: </dt>
        <dd className={`decode-${decodedInformation.valid}`}>
          {decodedInformation.valid}
        </dd>
      </dl>
    </>
  );
}

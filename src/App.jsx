import { useState } from "react";
import Encoder from "./Encoder/Encoder.jsx";
import Decoder from "./Decoder/Decoder.jsx";
import "./App.css";

export default function App() {
  const [isEncoding, setIsEncoding] = useState(true);

  return (
    <>
      <h1>IBM Delta Distance Barcode (ΔIBM)</h1>
      <fieldset>
        <label>
          Encode
          <input
            type="radio"
            name="mode"
            value="encoder"
            checked={isEncoding}
            onChange={() => setIsEncoding(true)}
          />
        </label>
        <label>
          Decode
          <input
            type="radio"
            name="mode"
            value="decoder"
            checked={!isEncoding}
            onChange={() => setIsEncoding(false)}
          />
        </label>
      </fieldset>
      {isEncoding ? <Encoder /> : <Decoder />}
    </>
  );
}

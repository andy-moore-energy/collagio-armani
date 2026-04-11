import { useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { CollageView } from "./components/CollageView";
import "./App.css";

type Screen = "upload" | "collage";

function App() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [images, setImages] = useState<string[]>([]);
  const [cuteness, setCuteness] = useState(4); // 0-4

  return screen === "upload" ? (
    <ImageUpload
      images={images}
      onImagesChange={setImages}
      onArmanio={() => setScreen("collage")}
      cuteness={cuteness}
      onCutenessChange={setCuteness}
    />
  ) : (
    <CollageView images={images} onBack={() => setScreen("upload")} cuteness={cuteness} />
  );
}

export default App;

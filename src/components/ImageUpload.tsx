import { useRef } from "react";

const CUTENESS_LABELS = ["Plain", "A little cute", "Pretty cute", "Very cute", "Maximum cuteness!"];

const CUTENESS_EMOJI = ["", "\u{1F33C}", "\u{1F338}", "\u{1F496}", "\u{2728}\u{1F496}\u{2728}"];

interface Props {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onArmanio: () => void;
  cuteness: number;
  onCutenessChange: (level: number) => void;
}

export function ImageUpload({
  images,
  onImagesChange,
  onArmanio,
  cuteness,
  onCutenessChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(readers).then((dataUrls) => {
      onImagesChange([...images, ...dataUrls]);
    });
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="screen">
      <h1>
        Collagio Armani <span className="heart-icon">&hearts;</span>
      </h1>
      <p className="subtitle">Make something beautiful</p>

      <p className="photo-count">
        <strong>{images.length}</strong> photo{images.length !== 1 ? "s" : ""} selected
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        style={{ display: "none" }}
      />
      <button className="btn" onClick={() => inputRef.current?.click()}>
        {images.length === 0 ? "\u{1F4F7} Choose Photos" : "\u{2728} Add More"}
      </button>

      <div className="thumbnail-grid">
        {images.map((src, i) => (
          <div key={i} className="thumbnail">
            <img src={src} alt={`Upload ${i + 1}`} />
            <button className="remove-btn" onClick={() => removeImage(i)}>
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Cuteness slider */}
      <div className="cuteness-slider">
        <label className="cuteness-label">Cuteness Level {CUTENESS_EMOJI[cuteness]}</label>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={cuteness}
          onChange={(e) => onCutenessChange(Number(e.target.value))}
          className="slider"
        />
        <p className="cuteness-desc">{CUTENESS_LABELS[cuteness]}</p>
      </div>

      {images.length >= 2 && (
        <button className="btn btn-shuffle btn-armanio" onClick={onArmanio}>
          &hearts; Armanio! &hearts;
        </button>
      )}
    </div>
  );
}

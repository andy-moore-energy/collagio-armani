import { useRef, useState } from "react";

const CUTENESS_LABELS = ["Plain", "A little cute", "Pretty cute", "Very cute", "Maximum cuteness!"];

const CUTENESS_EMOJI = ["", "\u{1F33C}", "\u{1F338}", "\u{1F496}", "\u{2728}\u{1F496}\u{2728}"];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  const [loading, setLoading] = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);

    // Defer to next frame so React renders the loading state first
    requestAnimationFrame(() => {
      const readers = files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }),
      );

      // Minimum 800ms so user always sees the unicorn fly
      Promise.all([Promise.all(readers), delay(800)]).then(([dataUrls]) => {
        onImagesChange([...images, ...dataUrls]);
        setLoading(false);
      });
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
      <button className="btn" onClick={() => inputRef.current?.click()} disabled={loading}>
        {images.length === 0 ? "\u{1F4F7} Choose Photos" : "\u{2728} Add More"}
      </button>

      <div className="thumbnail-area">
        {loading && (
          <div className="loading-overlay">
            <div className="unicorn-spinner">{"\u{1F984}"}</div>
            <p className="loading-text">Making magic...</p>
          </div>
        )}

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

      {images.length >= 1 && (
        <button className="btn btn-shuffle btn-armanio" onClick={onArmanio}>
          &hearts; Armanio! &hearts;
        </button>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("install-dismissed") === "1",
  );

  useEffect(() => {
    if (isStandalone || dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setDeferredPrompt(null));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "dismissed") {
        setDismissed(true);
        localStorage.setItem("install-dismissed", "1");
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("install-dismissed", "1");
    setDeferredPrompt(null);
    setShowIOSGuide(false);
  }, []);

  // Don't show if already installed, dismissed, or no prompt available (and not iOS)
  if (isStandalone || dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <button className="install-btn" onClick={handleInstall}>
        Add to Home Screen
      </button>

      {showIOSGuide && (
        <div className="ios-guide-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="ios-guide" onClick={(e) => e.stopPropagation()}>
            <p className="ios-guide-title">Install Collagio Armani</p>
            <ol className="ios-guide-steps">
              <li>
                Tap the <strong>Share</strong> button{" "}
                <span className="ios-share-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d6336c"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span>{" "}
                in Safari
              </li>
              <li>
                Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
              </li>
              <li>
                Tap <strong>&quot;Add&quot;</strong> to confirm
              </li>
            </ol>
            <div className="ios-guide-actions">
              <button className="btn" onClick={() => setShowIOSGuide(false)}>
                Got it!
              </button>
              <button className="ios-guide-dismiss" onClick={handleDismiss}>
                Don&apos;t show again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

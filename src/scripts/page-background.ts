import { AstroError } from "astro/errors";

interface LetterPosition {
  x: number;
  y: number;
  letter: string;
}

interface LetterInstance extends LetterPosition {
  timestamp: number;
  fadeout: number;
}

/**
 * PageBackground class
 */
class PageBackground {
  private LETTER_FADE_DURATION: [number, number] = [2, 7]; // Seconds

  // Spawn control
  private MAX_ACTIVE_LETTERS: number = 30; // Upper bound on concurrently animated letters
  private SPAWN_RATE_PER_SEC: number = 3; // Letters spawned per second
  private MAX_SPAWNS_PER_FRAME: number = 2; // Safety cap to avoid bursts in a single frame
  private MAX_DT_SECONDS: number = 0.05; // Clamp frame delta to 50ms to avoid catch-up bursts
  private spawnAccumulator: number = 0; // Accumulates spawn credits
  private lastFrameTime: number = performance.now(); // Timestamp of previous frame

  private baseCanvas: HTMLCanvasElement;
  private overlayCanvas: HTMLCanvasElement;

  private baseCtx: CanvasRenderingContext2D;
  private overlayCtx: CanvasRenderingContext2D;

  private width: number = window.innerWidth;
  private height: number = window.innerHeight;

  private letterPositions: LetterPosition[] = [];
  private letterInstances: LetterInstance[] = [];

  private primaryRgb!: string;
  private foregroundRgb!: string;

  // Timing safeguard: reset accumulators when focus/visibility changes to avoid catch-up bursts
  private handleVisibilityOrFocusChange = () => {
    this.lastFrameTime = performance.now();
    this.spawnAccumulator = 0;
  };

  /**
   * Initializes the background on the page.
   * @param baseCanvas - The base canvas element. Used for static letters.
   * @param overlayCanvas - The overlay canvas element. Used for animated letters.
   */
  constructor(baseCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
    // Get 2D context for both canvases
    const baseCtx = baseCanvas.getContext("2d");
    const overlayCtx = overlayCanvas.getContext("2d");

    // If either context is null, throw an error
    if (!baseCtx || !overlayCtx) {
      throw new AstroError("Unable to get 2D context.");
    }

    this.baseCanvas = baseCanvas;
    this.overlayCanvas = overlayCanvas;
    this.baseCtx = baseCtx;
    this.overlayCtx = overlayCtx;

    baseCanvas.width = this.width;
    baseCanvas.height = this.height;

    overlayCanvas.width = this.width;
    overlayCanvas.height = this.height;

    // Set colors based on theme
    this.setThemeColors();

    this.initBackground();

    // Reset timing on visibility/focus changes to avoid a large dt spike
    document.addEventListener("visibilitychange", this.handleVisibilityOrFocusChange);
    window.addEventListener("focus", this.handleVisibilityOrFocusChange);
    window.addEventListener("blur", this.handleVisibilityOrFocusChange);

    // Re-apply colors and redraw when theme changes
    window.addEventListener("theme-changed", () => {
      this.setThemeColors();
      this.resizeBackground();
    });

    requestAnimationFrame(this.redrawBackground);
  }

  /**
   * Sets the colors based on current theme (light/dark mode)
   */
  private setThemeColors = () => {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      // Dark mode: white letters on dark background
      this.primaryRgb = "255, 255, 255"; // White for animated letters
      this.foregroundRgb = "255, 255, 255"; // White for base layer
    } else {
      // Light mode: black letters on light background
      this.primaryRgb = "0, 0, 0"; // Black for animated letters
      this.foregroundRgb = "0, 0, 0"; // Black for base layer
    }
  };

  /**
   * Sets up the background canvases. The text is decided based on the title of the page.
   */
  private initBackground = () => {
    let text: string = document.title.toLowerCase().split(" | ")[0].replace(/\s/g, "_") || "littlebit.dev";
    // let text: string = '01';

    // Add additional underscore to separate words
    if (text.includes("_")) {
      text += "_";
    }

    // Letters are 17px wide and 35px tall
    const letters = Math.ceil(this.width / 17);
    const lines = Math.ceil(this.height / 35);

    // Loop through the canvas and draw the text
    this.baseCtx.font = '28px "Geist Mono Variable"';
    this.baseCtx.textAlign = "start";
    this.baseCtx.textBaseline = "top";
    this.baseCtx.fillStyle = `rgba(${this.foregroundRgb}, 0.01)`;

    for (let i = 0; i < lines; i++) {
      for (let j = 0; j < letters; j++) {
        this.baseCtx.fillText(text[j % text.length], j * 17, i * 35);
        this.letterPositions.push({
          x: j * 17,
          y: i * 35,
          letter: text[j % text.length],
        });
      }
    }

    // We no longer pre-spawn a large set of letters. Start empty and spawn gradually.
    this.overlayCtx.font = 'bold 28px "Geist Mono Variable"';
    this.overlayCtx.textAlign = "start";
    this.overlayCtx.textBaseline = "top";
    this.overlayCtx.fillStyle = `rgba(${this.primaryRgb}, 0)`;
    this.overlayCtx.shadowBlur = 16;
    this.overlayCtx.shadowColor = `rgba(${this.primaryRgb}, 0)`;

    // Start with a clean page: hide the subtle base layer initially
    this.baseCanvas.style.opacity = "0";
  };

  /**
   * Sine ease-in-out across the whole lifespan: 0 -> 1 -> 0
   * Starts fully transparent, peaks mid-life, and fades back to transparent.
   * @param timestamp - The current timestamp.
   * @param start - The start timestamp of a letter.
   * @param end - The end timestamp of a letter.
   */
  private easeInOutSine = (timestamp: number, start: number, end: number) => {
    const totalDuration = end - start;
    if (totalDuration <= 0) return 0;

    // Normalized progress clamped to [0, 1]
    const t = (timestamp - start) / totalDuration;
    const clamped = Math.max(0, Math.min(1, t));

    // Smooth 0 -> 1 -> 0 using a sine wave
    // sin(0) = 0, sin(PI/2) = 1, sin(PI) = 0
    return Math.sin(clamped * Math.PI);
  };

  /**
   * Grabs n random elements from an array.
   * @param arr - The array to grab elements from.
   * @param n - The number of elements to grab.
   * @returns - An array of n elements.
   */
  private getRandomAmountFromArray = <T>(arr: Array<T>, n = 20): Array<T> => {
    let len = arr.length;

    // Initialize arrays beforehand
    const result = new Array(n);
    const taken = new Array(len);

    if (n > len) {
      throw new AstroError("getRandomAmountFromArray: more elements taken than available");
    }

    while (n--) {
      const x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }

    return result;
  };

  /**
   * Redraws the overlay canvas and animates the letters.
   */
  private redrawBackground = (timestamp?: number) => {
    // Clear the overlay canvas
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    this.overlayCtx.font = 'bold 28px "Geist Mono Variable"';
    this.overlayCtx.textAlign = "start";
    this.overlayCtx.textBaseline = "top";
    this.overlayCtx.shadowBlur = 16;

    const now = timestamp ?? performance.now();

    // Spawn control: gradually add letters up to a cap
    const dt = Math.min(this.MAX_DT_SECONDS, Math.max(0, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;
    this.spawnAccumulator += dt * this.SPAWN_RATE_PER_SEC;

    let spawnsThisFrame = 0;
    while (
      this.spawnAccumulator >= 1 &&
      this.letterInstances.length < this.MAX_ACTIVE_LETTERS &&
      spawnsThisFrame < this.MAX_SPAWNS_PER_FRAME
    ) {
      this.spawnAccumulator -= 1;
      const [randomLetter] = this.getRandomAmountFromArray<LetterPosition>(this.letterPositions, 1);
      const animLength =
        this.LETTER_FADE_DURATION[0] + Math.random() * (this.LETTER_FADE_DURATION[1] - this.LETTER_FADE_DURATION[0]);
      this.letterInstances.push({
        x: randomLetter.x,
        y: randomLetter.y,
        letter: randomLetter.letter,
        timestamp: now,
        fadeout: now + animLength * 1000,
      });
      spawnsThisFrame++;
    }

    // Iterate by index so we can splice safely
    for (let i = this.letterInstances.length - 1; i >= 0; i--) {
      const letter = this.letterInstances[i];

      if (now >= letter.fadeout) {
        // Remove expired letter; do not immediately respawn to avoid bursts.
        this.letterInstances.splice(i, 1);
        continue;
      }

      const alpha = this.easeInOutSine(now, letter.timestamp, letter.fadeout);

      // Draw with smooth alpha
      this.overlayCtx.fillStyle = `rgba(${this.primaryRgb}, ${alpha})`;
      this.overlayCtx.shadowColor = `rgba(${this.primaryRgb}, ${alpha})`;
      this.overlayCtx.fillText(letter.letter, letter.x, letter.y);
    }

    requestAnimationFrame(this.redrawBackground);
  };

  /**
   * Resizes the background canvases.
   */
  public resizeBackground = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.baseCanvas.width = this.width;
    this.baseCanvas.height = this.height;

    this.overlayCanvas.width = this.width;
    this.overlayCanvas.height = this.height;

    this.baseCtx.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    this.letterInstances = [];
    this.letterPositions = [];

    // Update theme colors in case theme changed
    this.setThemeColors();

    this.initBackground();
  };
}

/**
 * Initializes the background. Font is loaded via Fontsource CSS imports.
 */
function initializeBackground() {
  const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement;
  const overlayCanvas = document.getElementById("overlay-canvas") as HTMLCanvasElement;

  const background = new PageBackground(canvas, overlayCanvas);

  window.addEventListener("resize", () => {
    background.resizeBackground();
  });
}

initializeBackground();

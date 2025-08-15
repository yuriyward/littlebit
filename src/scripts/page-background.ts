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

  private baseCanvas: HTMLCanvasElement;
  private overlayCanvas: HTMLCanvasElement;

  private baseCtx: CanvasRenderingContext2D;
  private overlayCtx: CanvasRenderingContext2D;

  private width: number = window.innerWidth;
  private height: number = window.innerHeight;

  private letterPositions: LetterPosition[] = [];
  private letterInstances: LetterInstance[] = [];

  private primaryRgb: string;
  private foregroundRgb: string;

  /**
   * Initializes the background on the page.
   * @param baseCanvas - The base canvas element. Used for static letters.
   * @param overlayCanvas - The overlay canvas element. Used for animated letters.
   */
  constructor(baseCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
    // Get 2D context for both canvases
    const baseCtx = baseCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    // If either context is null, throw an error
    if(!baseCtx || !overlayCtx) {
      throw new AstroError('Unable to get 2D context.');
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

    requestAnimationFrame(this.redrawBackground);
  }

  /**
   * Sets the colors based on current theme (light/dark mode)
   */
  private setThemeColors = () => {
    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
      // Dark mode: white letters on dark background
      this.primaryRgb = '255, 255, 255'; // White for animated letters
      this.foregroundRgb = '255, 255, 255'; // White for base layer
    } else {
      // Light mode: black letters on light background
      this.primaryRgb = '0, 0, 0'; // Black for animated letters
      this.foregroundRgb = '0, 0, 0'; // Black for base layer
    }
  }

  /**
   * Sets up the background canvases. The text is decided based on the title of the page.
   */
  private initBackground = () => {
    let text: string = document.title.toLowerCase().split(' | ')[0].replace(/\s/g, '_') || 'littlebit.dev';
    // let text: string = '01';

    // Add additional underscore to separate words
    if (text.includes("_")) {
      text += "_";
    }

    // Letters are 17px wide and 35px tall
    const letters = Math.ceil(this.width / 17);
    const lines = Math.ceil(this.height / 35);

    // Loop through the canvas and draw the text
    this.baseCtx.font = '28px Geist Mono';
    this.baseCtx.textAlign = 'start';
    this.baseCtx.textBaseline = 'top';
    this.baseCtx.fillStyle = `rgba(${this.foregroundRgb}, 0.01)`;

    for(let i = 0; i < lines; i++) {
      for(let j = 0; j < letters; j++) {
        this.baseCtx.fillText(text[j % text.length], j * 17, i * 35);
        this.letterPositions.push({
          x: j * 17,
          y: i * 35,
          letter: text[j % text.length]
        });
      }
    }

    // Randomly select 75% of the letters to animate
    const randomLetters = this.getRandomAmountFromArray<LetterPosition>(
      this.letterPositions,
      Number.parseInt((lines * 0.75).toFixed())
    );

    this.overlayCtx.font = 'bold 28px Geist Mono';
    this.overlayCtx.textAlign = 'start';
    this.overlayCtx.textBaseline = 'top';
    this.overlayCtx.fillStyle = `rgba(${this.primaryRgb}, 0)`;
    this.overlayCtx.shadowBlur = 16;
    this.overlayCtx.shadowColor = `rgba(${this.primaryRgb}, 0)`;

    // Draw the letters on the overlay canvas
    for(const letter of randomLetters) {
      this.overlayCtx.fillText(letter.letter, letter.x, letter.y);

      // Some number between LETTER_FADE_DURATION[0] and LETTER_FADE_DURATION[1] (in seconds)
      const animLength = this.LETTER_FADE_DURATION[0] + Math.random() * (this.LETTER_FADE_DURATION[1] - this.LETTER_FADE_DURATION[0]);

      this.letterInstances.push({
        x: letter.x,
        y: letter.y,
        letter: letter.letter,
        timestamp: Date.now(),
        fadeout: Date.now() + animLength * 1000
      });
    }

    // Make the base canvas visible
    this.baseCanvas.style.opacity = '1';
  }

  /**
   * Simple sine easing function. Used for fading in and out letters.
   * @param timestamp - The current timestamp.
   * @param start - The start timestamp of a letter.
   * @param end - The end timestamp of a letter.
   */
  private easeInOutSine = (timestamp: number, start: number, end: number) => {
    const totalDuration = end - start;

    // If the current timestamp is before the start, return 0
    if (timestamp < start) {
      return 0;
    }

    // If the current timestamp is after the end, return 0
    if (timestamp > end) {
      const elapsedAfterEnd = timestamp - end;
      const progressAfterEnd = elapsedAfterEnd / (totalDuration / 2);

      return Math.sin(progressAfterEnd * Math.PI);
    }

    const progress = (timestamp - start) / totalDuration;

    return Math.max(0, 0.5 - 0.5 * Math.cos(progress * Math.PI));
  }

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

    if(n > len) {
      throw new AstroError("getRandomAmountFromArray: more elements taken than available");
    }

    while(n--) {
      const x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }

    return result;
  }

  /**
   * Redraws the overlay canvas and animates the letters.
   */
  private redrawBackground = () => {
    // Clear the overlay canvas
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    this.overlayCtx.font = 'bold 28px Geist Mono';
    this.overlayCtx.textAlign = 'start';
    this.overlayCtx.textBaseline = 'top';
    this.overlayCtx.shadowBlur = 16;

    for(const letter of this.letterInstances) {
      if (letter.fadeout > Date.now()) continue;

      const alpha = this.easeInOutSine(Date.now(), letter.timestamp, letter.fadeout);

      if(alpha <= 0 && Date.now() > letter.fadeout) {
        this.letterInstances.splice(this.letterInstances.indexOf(letter), 1);
        const randomLetter = this.getRandomAmountFromArray<LetterPosition>(this.letterPositions, 1);

        this.letterInstances.push({
          x: randomLetter[0].x,
          y: randomLetter[0].y,
          letter: randomLetter[0].letter,
          timestamp: Date.now(),
          fadeout: Date.now() + (this.LETTER_FADE_DURATION[0] + Math.random() * (this.LETTER_FADE_DURATION[1] - this.LETTER_FADE_DURATION[0])) * 1000
        });
      }

      this.overlayCtx.fillStyle = `rgba(${this.primaryRgb}, ${alpha})`;
      this.overlayCtx.shadowColor = `rgba(${this.primaryRgb}, ${alpha})`;
      this.overlayCtx.fillText(letter.letter, letter.x, letter.y);
    }

    requestAnimationFrame(this.redrawBackground);
  }

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
  }
}

/**
 * Loads the Geist Mono font. We have to do this asynchronously because the font is not preloaded.
 */
async function loadFont() {
  const font = new FontFace('Geist Mono', 'url(/fonts/GeistMono.woff2)');

  await font.load();

  document.fonts.add(font);
}

/**
 * First loads the Geist Mono font, then initializes the background.
 */
async function initializeBackground() {
  await loadFont();

  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
  const overlayCanvas = document.getElementById('overlay-canvas') as HTMLCanvasElement;

  const background = new PageBackground(canvas, overlayCanvas);

  window.addEventListener('resize', () => {
    background.resizeBackground();
  });
}

initializeBackground();

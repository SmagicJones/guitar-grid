const allNotes = [
  "c",
  "cs",
  "d",
  "ds",
  "e",
  "f",
  "fs",
  "g",
  "gs",
  "a",
  "as",
  "b",
];

function rotateScale(intervals, steps) {
  return intervals
    .map((_, i) => {
      const shifted =
        intervals[(i + steps) % intervals.length] - intervals[steps];
      return ((shifted % 12) + 12) % 12;
    })
    .sort((a, b) => a - b);
}

const major = [0, 2, 4, 5, 7, 9, 11];
const majorPentatonic = [major[0], major[1], major[2], major[4], major[5]]; // R 2 3 5 6

const scales = {
  major: major,
  minor: rotateScale(major, 5),
  majorPentatonic: majorPentatonic,
  minorPentatonic: rotateScale(majorPentatonic, 4), // start from the 5th note
};

function getScaleNotes(root, scaleIntervals) {
  const rootIndex = allNotes.indexOf(root);
  return scaleIntervals.map((interval, i) => ({
    note: allNotes[(rootIndex + interval) % 12],
    degree: i + 1,
  }));
}

function highlightScale() {
  const root = document.getElementById("root-select").value;
  const scaleType = document.getElementById("scale-select").value;
  const scaleNotes = getScaleNotes(root, scales[scaleType]);

  const noteToDegree = {};
  scaleNotes.forEach(({ note, degree }) => {
    noteToDegree[note] = degree;
  });

  document.querySelectorAll(".box").forEach((box) => {
    // clear previous interval classes
    for (let i = 1; i <= 7; i++) box.classList.remove(`interval-${i}`);

    const noteClass = [...box.classList].find((c) => allNotes.includes(c));
    if (noteClass && noteToDegree[noteClass] !== undefined) {
      box.classList.add(`interval-${noteToDegree[noteClass]}`);
    }
  });
}

document
  .getElementById("root-select")
  .addEventListener("change", highlightScale);
document
  .getElementById("scale-select")
  .addEventListener("change", highlightScale);

document
  .getElementById("interval-toggle")
  .addEventListener("change", function () {
    document.body.classList.toggle("single-colour", !this.checked);
    updateLegend();
  });

const intervalLabels = ["Root", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const intervalColors = [
  "#e63946",
  "#f4a261",
  "#f9c74f",
  "#90be6d",
  "#4cc9f0",
  "#9b72cf",
  "#f77f00",
];

function updateLegend() {
  const legend = document.querySelector(".legend");
  const isMulti = document.getElementById("interval-toggle").checked;
  legend.innerHTML = intervalLabels
    .map(
      (label, i) => `
          <div class="legend-item">
            <div class="legend-swatch" style="background:${isMulti ? intervalColors[i] : "#e63946"}"></div>
            ${i + 1} ${label}
          </div>
        `,
    )
    .join("");
}

// --- Audio ---
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

const soundToggle = document.getElementById("sound-toggle");
const soundLabel = soundToggle.closest("label");

soundToggle.addEventListener("change", function () {
  if (this.checked) {
    // user gesture — safe to create/resume context here
    getAudioCtx();
    soundLabel.childNodes[1].textContent = " Sound 🔊";
  } else {
    soundLabel.childNodes[1].textContent = " Sound 🔇";
  }
});

// semitone offset of each open string from A4 (440hz)
// E2=-29, A2=-24, D3=-19, G3=-14, B3=-10, E4=-5
const openStringSemitones = {
  "string-1": -29, // E2
  "string-2": -24, // A2
  "string-3": -19, // D3
  "string-4": -14, // G3
  "string-5": -10, // B3
  "string-6": -5, // E4
};

function playNote(semitoneFromA4) {
  if (!document.getElementById("sound-toggle").checked) return;
  const ctx = getAudioCtx();
  const a4 = document.getElementById("tuning-toggle").checked ? 432 : 440;
  const freq = a4 * Math.pow(2, semitoneFromA4 / 12);

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  // slightly detuned second oscillator for warmth
  const osc2 = ctx.createOscillator();
  const gainNode2 = ctx.createGain();
  osc2.connect(gainNode2);
  gainNode2.connect(ctx.destination);

  osc.type = "triangle";
  osc2.type = "triangle";
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc2.frequency.setValueAtTime(freq * 1.003, ctx.currentTime); // slight detune

  // guitar-like envelope: fast attack, slow decay
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

  gainNode2.gain.setValueAtTime(0, ctx.currentTime);
  gainNode2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
  gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

  osc.start(ctx.currentTime);
  osc2.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2.5);
  osc2.stop(ctx.currentTime + 2.5);
}

function addClickHandlers() {
  document.querySelectorAll(".box").forEach((box) => {
    box.style.cursor = "pointer";
    box.addEventListener("click", () => {
      const stringClass = [...box.classList].find((c) =>
        c.startsWith("string-"),
      );
      const fretRow = Math.floor(
        [...document.querySelectorAll(".box")].indexOf(box) / 6,
      );
      const baseSemitone = openStringSemitones[stringClass];
      playNote(baseSemitone + fretRow);
    });
  });
}

addClickHandlers();

highlightScale();
updateLegend();

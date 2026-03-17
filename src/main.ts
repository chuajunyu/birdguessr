import "./style.css";
import {
  SPECIES,
  createGameState,
  getCorrectSpecies,
  loadRecordings,
  pickRound,
  submitGuess,
} from "./game";

const $ = (sel: string) => document.querySelector(sel)!;

const audio = $("#audio") as HTMLAudioElement;
const playBtn = $("#play-btn") as HTMLButtonElement;
const iconPlay = $(".icon-play") as Element;
const iconPause = $(".icon-pause") as Element;
const choicesEl = $("#choices") as HTMLDivElement;
const feedbackEl = $("#feedback") as HTMLDivElement;
const feedbackText = $("#feedback-text") as HTMLParagraphElement;
const sonoImg = $("#sono-img") as HTMLImageElement;
const xcLink = $("#xc-link") as HTMLAnchorElement;
const nextBtn = $("#next-btn") as HTMLButtonElement;
const streakEl = $("#streak") as HTMLSpanElement;
const bestEl = $("#best") as HTMLSpanElement;
const loadingEl = $("#loading") as HTMLDivElement;
const gameEl = $("#game") as HTMLDivElement;
const errorEl = $("#error") as HTMLDivElement;

const state = createGameState();

function ensureProtocol(url: string): string {
  return url.startsWith("//") ? `https:${url}` : url;
}

function updateScore() {
  streakEl.textContent = String(state.streak);
  bestEl.textContent = String(state.best);
}

function setPlayIcon(playing: boolean) {
  iconPlay.classList.toggle("hidden", playing);
  iconPause.classList.toggle("hidden", !playing);
}

function startRound() {
  const rec = pickRound(state);

  audio.src = `/audio/xc/${rec.id}/download`;
  audio.load();
  setPlayIcon(false);

  choicesEl.innerHTML = "";
  for (const s of SPECIES) {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = s.en;
    btn.addEventListener("click", () => handleGuess(s.en));
    choicesEl.appendChild(btn);
  }

  feedbackEl.classList.add("hidden");
  choicesEl.classList.remove("hidden");
}

function handleGuess(guessEn: string) {
  if (state.answered) return;

  const isCorrect = submitGuess(state, guessEn);
  const correct = getCorrectSpecies(state.current!);
  updateScore();

  const buttons = choicesEl.querySelectorAll<HTMLButtonElement>(".choice-btn");
  for (const btn of buttons) {
    btn.disabled = true;
    if (btn.textContent === correct.en) {
      btn.classList.add("correct");
    } else if (btn.textContent === guessEn && !isCorrect) {
      btn.classList.add("wrong");
    }
  }

  feedbackText.textContent = isCorrect
    ? `Correct! That's the ${correct.en}.`
    : `Wrong! That was the ${correct.en}.`;
  feedbackText.className = isCorrect ? "text-correct" : "text-wrong";

  const rec = state.current!;
  sonoImg.src = ensureProtocol(rec.sono.med);
  xcLink.href = ensureProtocol(rec.url);

  feedbackEl.classList.remove("hidden");
}

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().then(() => setPlayIcon(true)).catch(() => setPlayIcon(false));
  } else {
    audio.pause();
    setPlayIcon(false);
  }
});

audio.addEventListener("ended", () => setPlayIcon(false));

nextBtn.addEventListener("click", () => startRound());

async function init() {
  try {
    await loadRecordings(state);
    loadingEl.classList.add("hidden");
    gameEl.classList.remove("hidden");
    updateScore();
    startRound();
  } catch (err) {
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
    errorEl.textContent = `Failed to load recordings. Make sure your API key is set in .env. (${err})`;
  }
}

init();

const micButton = document.getElementById('mic');
const clearButton = document.getElementById('clear');
const copyButton = document.getElementById('copy');
const transcriptEl = document.getElementById('transcript');

let recognition;
let isListening = false;
// keep committed (finalized) transcript separate so we can append interim text live
let committedText = '';

// Ensure feather icons are loaded and initialize UI icons/labels
function initIconsAndLabels(){
  // set button contents (preserve accessibility and allow JS-only fallbacks)
  try {
    const mic = document.getElementById('mic');
    const clear = document.getElementById('clear');
    const copy = document.getElementById('copy');
    const back = document.querySelector('.back-link');
    if (mic) mic.innerHTML = '<i data-feather="mic"></i> <span class="btn-label">Start</span>';
    if (clear) clear.innerHTML = '<i data-feather="trash-2"></i> <span class="btn-label">Clear</span>';
    if (copy) copy.innerHTML = '<i data-feather="copy"></i> <span class="btn-label">Copy</span>';
    if (back) back.innerHTML = '<i data-feather="chevron-left"></i> Back';
    if (window.feather) {
      try { feather.replace(); } catch (e) { /* noop */ }
    }
  } catch (e) { console.warn('icon init failed', e); }
}

function ensureFeather(cb){
  if (window.feather) return cb();
  const src = 'https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js';
  const existing = document.querySelector('script[src="' + src + '"]');
  if (existing) {
    existing.addEventListener('load', cb);
    return;
  }
  const s = document.createElement('script');
  s.src = src;
  s.onload = cb;
  s.onerror = () => { console.warn('failed to load feather icons'); cb(); };
  document.head.appendChild(s);
}

document.addEventListener('DOMContentLoaded', () => ensureFeather(initIconsAndLabels));

function appendText(text){
  // add finalized text to the committed buffer and render
  committedText = committedText ? committedText + "\n" + text : text;
  transcriptEl.value = committedText;
  // scroll to end so user sees latest text
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

async function setupRecognition(){
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech Recognition API not supported in this browser. Use Chrome/Edge.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.lang = navigator.language || 'en-US';

  r.onresult = (evt) => {
    let finalText = '';
    let interimText = '';
    for (let i = evt.resultIndex; i < evt.results.length; ++i) {
      const res = evt.results[i];
      if (res.isFinal) finalText += res[0].transcript;
      else interimText += res[0].transcript;
    }
    if (finalText) appendText(finalText.trim());

    // Always render interim appended to committed text so user sees live speech
    if (interimText) {
      const display = committedText ? committedText + "\n" + interimText.trim() : interimText.trim();
      transcriptEl.value = display;
    } else {
      // if no interim, ensure the textarea shows the committed text
      transcriptEl.value = committedText;
    }
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  };

  r.onerror = (e) => {
    console.error('speech error', e);
  };

  r.onend = () => {
    // if user didn't stop, restart to continue indefinitely
    if (isListening) {
      try { r.start(); } catch (e) { console.warn('restart failed', e); }
    }
  };

  return r;
}

micButton.addEventListener('click', async () => {
  const label = micButton.querySelector('.btn-label');
  if (!isListening) {
    recognition = recognition || await setupRecognition();
    if (!recognition) return;
    try {
      recognition.start();
      isListening = true;
      micButton.setAttribute('aria-pressed', 'true');
      if (label) label.textContent = 'Stop';
    } catch (e) { console.error(e); }
  } else {
    isListening = false;
    micButton.setAttribute('aria-pressed', 'false');
    if (label) label.textContent = 'Start';
    if (recognition) recognition.stop();
    transcriptEl.placeholder = 'Transcription will appear here...';
  }
});

clearButton.addEventListener('click', () => {
  transcriptEl.value = '';
  transcriptEl.placeholder = 'Transcription will appear here...';
});

copyButton.addEventListener('click', async () => {
  const label = copyButton.querySelector('.btn-label');
  try {
    await navigator.clipboard.writeText(transcriptEl.value);
    if (label) label.textContent = 'Copied';
    setTimeout(() => { if (label) label.textContent = 'Copy'; }, 1200);
  } catch (e) {
    console.error('copy failed', e);
    alert('Copy failed');
  }
});



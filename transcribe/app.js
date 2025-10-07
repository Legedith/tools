const micButton = document.getElementById('mic');
const clearButton = document.getElementById('clear');
const copyButton = document.getElementById('copy');
const transcriptEl = document.getElementById('transcript');

let recognition;
let isListening = false;
// keep committed (finalized) transcript separate so we can append interim text live
let committedText = '';

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
  if (!isListening) {
    recognition = recognition || await setupRecognition();
    if (!recognition) return;
    try {
      recognition.start();
      isListening = true;
      micButton.setAttribute('aria-pressed', 'true');
      micButton.textContent = '⏹️ Stop';
    } catch (e) { console.error(e); }
  } else {
    isListening = false;
    micButton.setAttribute('aria-pressed', 'false');
    micButton.textContent = '🎙️ Start';
    if (recognition) recognition.stop();
    transcriptEl.placeholder = 'Transcription will appear here...';
  }
});

clearButton.addEventListener('click', () => {
  transcriptEl.value = '';
  transcriptEl.placeholder = 'Transcription will appear here...';
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(transcriptEl.value);
    copyButton.textContent = 'Copied';
    setTimeout(() => copyButton.textContent = 'Copy', 1200);
  } catch (e) {
    console.error('copy failed', e);
    alert('Copy failed');
  }
});



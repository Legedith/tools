# Live Transcribe

Static web tool that uses the browser Speech Recognition API to transcribe microphone audio continuously.

How to use

- Open `index.html` in Chrome/Edge (SpeechRecognition works best there).
- Click the microphone button to start/stop transcription. While active it will append final segments to the textarea.
- Use `Clear` to remove the current transcript, `Copy` to copy to clipboard.

Hosting on GitHub Pages

1. Push this repository to GitHub.
2. In repository settings enable GitHub Pages and set the site source to the `main` branch root.
3. Access `https://<your-username>.github.io/<repo>/transcribe/`.

Automatic deploy with GitHub Actions

If you want changes to `transcribe/` to be published automatically to GitHub Pages, this repo includes `.github/workflows/pages.yml`. The workflow uploads the `transcribe/` directory and deploys it when you push to `main`.

Commands to push this repo (run locally):

```bash
git init
git add .
git commit -m "Add transcribe tool and pages workflow"
git branch -M main
git remote add origin git@github.com:<your-username>/<repo>.git
git push -u origin main
```



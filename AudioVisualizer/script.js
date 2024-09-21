window.onload = function() {
  const audioPlayer = document.getElementById('audio-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const progressBar = document.getElementById('progress-bar');
  const timeDisplay = document.getElementById('time-display');
  const canvas = document.getElementById('audio-visualizer');
  const ctx = canvas.getContext('2d');
  let audioCtx;
  let source;
  let analyser;
  let dataArray;
  let bufferLength;
  const fileInput = document.getElementById('audio-file-input');
  const fileInputLabel = document.getElementById('file-input-label');

  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      fileInputLabel.classList.add('has-file');
      fileInputLabel.innerHTML = file.name;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const audioData = e.target.result;
      audioPlayer.src = audioData;
      audioPlayer.load();

      initAudioContext();
    };
    reader.readAsDataURL(file);
  });

  playPauseBtn.addEventListener('click', function() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseBtn.textContent = '❚❚';
    } else {
      audioPlayer.pause();
      playPauseBtn.textContent = '►';
    }
  });

  audioPlayer.addEventListener('timeupdate', function() {
    progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    timeDisplay.textContent = formatTime(audioPlayer.currentTime);
  });

  progressBar.addEventListener('input', function() {
    const seekTime = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function initAudioContext() {
    if (window.AudioContext || window.webkitAudioContext) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioPlayer.onloadedmetadata = function() {
        source = audioCtx.createMediaElementSource(audioPlayer);
        analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        draw();
      };
    } else {
      console.error('Web Audio API not supported.');
    }
  }

  function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const MAX_BAR_HEIGHT = HEIGHT - 11;
    const numBars = 30;
    const barWidth = WIDTH / numBars - 1;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    analyser.getByteFrequencyData(dataArray);
    let x = 0;

    for(let i = 0; i < numBars; i++) {
      let sum = 0;
      const count = Math.floor(bufferLength / numBars);
      for(let j = 0; j < count; j++) {
        sum += dataArray[i * count + j];
      }
      const barHeight = Math.min(sum / count / 3, MAX_BAR_HEIGHT); 
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    requestAnimationFrame(draw);
  }
};

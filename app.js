const videoUrlInput = document.getElementById('video-url');
const loadVideoButton = document.getElementById('load-video');
const videoStatus = document.getElementById('video-status');
const videoPlayer = document.getElementById('video-player');
const videoMeta = document.getElementById('video-meta');
const timeline = document.getElementById('timeline');
const currentTimeLabel = document.getElementById('current-time');
const durationLabel = document.getElementById('duration');
const downloadButton = document.getElementById('download-video');
const directDownload = document.getElementById('direct-download');
const downloadProgress = document.getElementById('download-progress');
const downloadPercent = document.getElementById('download-percent');
const downloadSize = document.getElementById('download-size');
const clipStartInput = document.getElementById('clip-start');
const clipEndInput = document.getElementById('clip-end');
const setStartButton = document.getElementById('set-start');
const setEndButton = document.getElementById('set-end');
const recordButton = document.getElementById('record-section');
const stopRecordButton = document.getElementById('stop-record');
const recordStatus = document.getElementById('record-status');
const clipList = document.getElementById('clip-list');

let activeStream = null;
let recorder = null;
let recordTimer = null;
let recordedChunks = [];

const formatTime = (timeSeconds) => {
    if (!Number.isFinite(timeSeconds)) {
        return '00:00';
    }
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const parseTimeInput = (value) => {
    if (!value) {
        return null;
    }
    const parts = value.split(':').map((part) => Number(part));
    if (parts.some((part) => Number.isNaN(part))) {
        return null;
    }
    if (parts.length === 1) {
        return parts[0];
    }
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return null;
};

const updateStatus = (element, message, type = 'default') => {
    element.textContent = message;
    element.classList.remove('success', 'error');
    if (type === 'success') {
        element.classList.add('success');
    }
    if (type === 'error') {
        element.classList.add('error');
    }
};

const updateTimeline = () => {
    const duration = videoPlayer.duration || 0;
    const current = videoPlayer.currentTime || 0;
    currentTimeLabel.textContent = formatTime(current);
    durationLabel.textContent = formatTime(duration);
    if (duration > 0) {
        timeline.value = ((current / duration) * 100).toFixed(2);
    } else {
        timeline.value = 0;
    }
};

const enableControls = (isEnabled) => {
    downloadButton.disabled = !isEnabled;
    setStartButton.disabled = !isEnabled;
    setEndButton.disabled = !isEnabled;
    recordButton.disabled = !isEnabled;
    directDownload.classList.toggle('disabled', !isEnabled);
    if (!isEnabled) {
        directDownload.removeAttribute('href');
    }
};

const resetDownloadUI = () => {
    downloadProgress.style.width = '0%';
    downloadPercent.textContent = '0%';
    downloadSize.textContent = '0 MB';
};

const validateMp4Url = (url) => {
    if (!url) {
        return { valid: false, reason: 'Please enter a video URL.' };
    }
    if (!url.startsWith('http')) {
        return { valid: false, reason: 'URL must start with http or https.' };
    }
    if (!url.toLowerCase().includes('.mp4')) {
        return { valid: false, reason: 'Link must point to a direct MP4 file.' };
    }
    return { valid: true };
};

const loadVideo = async () => {
    const url = videoUrlInput.value.trim();
    const validation = validateMp4Url(url);
    if (!validation.valid) {
        updateStatus(videoStatus, validation.reason, 'error');
        enableControls(false);
        videoPlayer.removeAttribute('src');
        return;
    }

    updateStatus(videoStatus, 'Validating stream...', 'default');
    resetDownloadUI();
    enableControls(false);

    videoPlayer.pause();
    videoPlayer.src = url;
    videoPlayer.load();

    const canPlay = videoPlayer.canPlayType('video/mp4');
    if (!canPlay) {
        updateStatus(videoStatus, 'This browser cannot play MP4 files. Please use Chrome.', 'error');
        return;
    }

    try {
        await videoPlayer.play();
        videoPlayer.pause();
        updateStatus(videoStatus, 'MP4 stream loaded. Ready to play.', 'success');
        videoMeta.textContent = 'MP4 stream ready';
        enableControls(true);
        directDownload.href = url;
        updateTimeline();
    } catch (error) {
        updateStatus(videoStatus, 'Unable to play this MP4. Check the link and permissions.', 'error');
        videoMeta.textContent = 'Stream unavailable';
    }
};

const downloadVideo = async () => {
    const url = videoPlayer.src;
    if (!url) {
        return;
    }

    resetDownloadUI();
    updateStatus(videoStatus, 'Starting download...', 'default');

    try {
        const response = await fetch(url);
        if (!response.ok || !response.body) {
            throw new Error('Unable to stream file.');
        }
        const totalBytes = Number(response.headers.get('content-length')) || 0;
        const reader = response.body.getReader();
        let receivedBytes = 0;
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            chunks.push(value);
            receivedBytes += value.length;
            if (totalBytes) {
                const percent = Math.round((receivedBytes / totalBytes) * 100);
                downloadProgress.style.width = `${percent}%`;
                downloadPercent.textContent = `${percent}%`;
                downloadSize.textContent = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
            } else {
                downloadPercent.textContent = '...';
                downloadSize.textContent = `${(receivedBytes / (1024 * 1024)).toFixed(2)} MB`; 
            }
        }

        const blob = new Blob(chunks, { type: 'video/mp4' });
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = 'video.mp4';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);

        updateStatus(videoStatus, 'Download completed.', 'success');
    } catch (error) {
        updateStatus(videoStatus, 'Download failed. The server may block cross-origin downloads.', 'error');
    }
};

const startRecording = async () => {
    if (!videoPlayer.src) {
        updateStatus(recordStatus, 'Load an MP4 before recording.', 'error');
        return;
    }

    const startTime = parseTimeInput(clipStartInput.value);
    const endTime = parseTimeInput(clipEndInput.value);
    if (startTime === null || endTime === null || endTime <= startTime) {
        updateStatus(recordStatus, 'Enter valid start/end times (end must be after start).', 'error');
        return;
    }

    try {
        if (!activeStream) {
            activeStream = videoPlayer.captureStream();
        }
        const preferredTypes = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm'
        ];
        const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';
        recorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : undefined);
        recordedChunks = [];

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
            const clipUrl = URL.createObjectURL(blob);
            const clipItem = document.createElement('div');
            clipItem.className = 'clip-item';

            const label = document.createElement('span');
            label.textContent = `Clip ${formatTime(startTime)} - ${formatTime(endTime)}`;

            const downloadLink = document.createElement('a');
            const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            downloadLink.href = clipUrl;
            downloadLink.download = `clip-${formatTime(startTime)}-${formatTime(endTime)}.${extension}`;
            downloadLink.textContent = 'Save clip';

            clipItem.append(label, downloadLink);
            clipList.prepend(clipItem);

            updateStatus(recordStatus, 'Recording complete. Save your clip below.', 'success');
            stopRecordButton.disabled = true;
            recordButton.disabled = false;
        };

        videoPlayer.currentTime = startTime;
        await videoPlayer.play();
        recorder.start();
        recordButton.disabled = true;
        stopRecordButton.disabled = false;
        updateStatus(recordStatus, 'Recording section in progress...', 'default');

        recordTimer = window.setInterval(() => {
            if (videoPlayer.currentTime >= endTime) {
                stopRecording();
            }
        }, 200);
    } catch (error) {
        updateStatus(recordStatus, 'Recording failed. Ensure playback is allowed in this tab.', 'error');
    }
};

const stopRecording = () => {
    if (recordTimer) {
        window.clearInterval(recordTimer);
        recordTimer = null;
    }
    if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
    }
    videoPlayer.pause();
};

loadVideoButton.addEventListener('click', loadVideo);
videoUrlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        loadVideo();
    }
});

videoPlayer.addEventListener('loadedmetadata', updateTimeline);
videoPlayer.addEventListener('timeupdate', updateTimeline);
videoPlayer.addEventListener('ended', updateTimeline);

timeline.addEventListener('input', (event) => {
    const percent = Number(event.target.value);
    if (videoPlayer.duration) {
        videoPlayer.currentTime = (percent / 100) * videoPlayer.duration;
    }
});

downloadButton.addEventListener('click', downloadVideo);

setStartButton.addEventListener('click', () => {
    clipStartInput.value = formatTime(videoPlayer.currentTime);
});

setEndButton.addEventListener('click', () => {
    clipEndInput.value = formatTime(videoPlayer.currentTime);
});

recordButton.addEventListener('click', startRecording);
stopRecordButton.addEventListener('click', stopRecording);

enableControls(false);
resetDownloadUI();
updateTimeline();

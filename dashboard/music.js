// Music Controls
const createController = require('./musikcube-controller.js');
const musicController = createController();

// Fetch music status
async function fetchMusicStatus() {
    try {
        const response = await fetch('/api/music/status');
        const status = await response.json();

        if (status.error) {
            console.error('Music error:', status.error);
            return;
        }

        Object.assign(musicState, status);
        updateMusicUI();
    } catch (error) {
        console.error('Failed to fetch music status:', error);
    }
}

// Send music control command
async function musicControl(action, param = null) {
    try {
        const url = param ? 
            `/api/music/control?action=${action}&param=${param}` :
            `/api/music/control?action=${action}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.error) {
            console.error('Control error:', result.error);
            return false;
        }

        // Refresh status after control
        setTimeout(fetchMusicStatus, 300);
        return true;
    } catch (error) {
        console.error('Failed to control music:', error);
        return false;
    }
}

// Update music UI
async function updateMusicUI() {
    const status = await musicController.getStatus();

    // Update now playing info
    document.getElementById('music-status').textContent = status.playing ? '🎵 Playing' : '⏸ Paused';
    document.getElementById('music-artist').textContent = status.artist || 'Unknown';
    document.getElementById('music-title').textContent = status.title || 'No Track';
    document.getElementById('music-album').textContent = status.album || '';

    // Update position (if available)
    document.getElementById('music-position').textContent = status.position || '0:00';
    document.getElementById('music-length').textContent = status.length || '0:00';

    // Update volume
    const volume = status.volume || 0;
    document.getElementById('volume-slider').value = volume;
    document.getElementById('volume-value').textContent = volume + '%';
    document.getElementById('volume-bar').style.width = volume + '%';

    // Update mute button
    document.getElementById('mute-btn').textContent = status.muted ? '🔇' : '🔊';

    // Update controls based on controller type
    const controllerType = status.controller || 'Unknown';
    if (controllerType === 'musikcube') {
        // Hide controls not supported by musikcube
        const unsupportedControls = ['volume-up-btn', 'volume-down-btn', 'mute-btn', 'volume-slider-container'];
        unsupportedControls.forEach(id => {
            document.getElementById(id).style.opacity = '0.5';
            document.getElementById(id).style.pointerEvents = 'none';
        });

        // Show message
        document.getElementById('controller-info').textContent = 'Musikcube (DBus)';
    }
}

// Event handlers
async function playPause() {
    if ((await musicController.getStatus()).playing) {
        await musicController.pause();
    } else {
        await musicController.play();
    }
}

async function nextTrack() {
    await musicController.next();
}

async function prevTrack() {
    await musicController.previous();
}

async function volumeUp() {
    await musicController.volumeUp();
}

async function volumeDown() {
    await musicController.volumeDown();
}

async function setVolume(value) {
    await musicController.setVolume(value);
}

async function toggleMute() {
    await musicController.mute();
}

// Initialize music controls on page load
document.addEventListener('DOMContentLoaded', () => {
    // Fetch status immediately
    fetchMusicStatus();

    // Set up auto-refresh every 2 seconds
    setInterval(fetchMusicStatus, 2000);

    // Show controller info
    document.getElementById('controller-info').textContent = 'Loading...';
});

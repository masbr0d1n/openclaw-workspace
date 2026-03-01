#!/usr/bin/env node
/**
 * Simple music controller for musikcube
 * Tries to control musikcube using various methods
 */

const { execSync } = require('child_process');

class MusikcubeController {
    constructor() {
        this.detectPlayer();
    }

    detectPlayer() {
        this.available = false;

        // Check if musikcube is installed
        try {
            execSync('which musikcube', { stdio: 'ignore' });
            console.log('✓ Musikcube terdeteksi');
            this.available = true;
        } catch {
            console.log('✗ Musikcube tidak ditemukan');
        }
    }

    getStatus() {
        if (!this.available) return this.getMockStatus();

        // Try using mpris-ctl or dbus
        try {
            // Check if mpris-ctl is available
            try {
                execSync('which mpris-ctl', { stdio: 'ignore' });
                return this.getStatusWithMpris();
            } catch {
                // Try direct dbus query
                return this.getStatusWithDbus();
            }
        } catch (error) {
            console.log('Error getting status:', error.message);
            return this.getMockStatus();
        }
    }

    getStatusWithMpris() {
        try {
            const output = execSync('mpris-ctl metadata org.mpris.MediaPlayer2.musikcube', { encoding: 'utf-8' });
            return this.parseMprisOutput(output);
        } catch {
            return this.getMockStatus();
        }
    }

    getStatusWithDbus() {
        try {
            const status = execSync('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get org.mpris.MediaPlayer2 PlaybackStatus', { encoding: 'utf-8' });
            const metadata = execSync('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get org.mpris.MediaPlayer2.Metadata', { encoding: 'utf-8' });

            return {
                playing: status.trim() === 'Playing',
                artist: metadata.match(/xesam:artist: (.+)/)?.[1] || 'Unknown',
                title: metadata.match(/xesam:title: (.+)/)?.[1] || 'Unknown',
                album: metadata.match(/xesam:album: (.+)/)?.[1] || ''
            };
        } catch {
            return this.getMockStatus();
        }
    }

    parseMprisOutput(output) {
        const lines = output.trim().split('\n');
        const status = {
            playing: false,
            artist: 'Unknown',
            title: 'No Track',
            album: ''
        };

        for (const line of lines) {
            if (line.includes('xesam:artist:')) {
                status.artist = line.split(':').slice(1).join(':').trim();
            } else if (line.includes('xesam:title:')) {
                status.title = line.split(':').slice(1).join(':').trim();
            }
        }

        status.playing = true;
        return status;
    }

    getMockStatus() {
        return {
            playing: false,
            artist: 'Musikcube',
            title: 'Buka aplikasi Musikcube',
            album: 'Player Terdeteksi'
        };
    }

    play() {
        if (!this.available) return;
        execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2.Play', { stdio: 'ignore' });
    }

    pause() {
        if (!this.available) return;
        execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2.Pause', { stdio: 'ignore' });
    }

    toggle() {
        const status = this.getStatus();
        if (status.playing) {
            this.pause();
        } else {
            this.play();
        }
    }

    next() {
        if (!this.available) return;
        execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2.Next', { stdio: 'ignore' });
    }

    previous() {
        if (!this.available) return;
        execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2.Previous', { stdio: 'ignore' });
    }

    volumeUp() {
        console.log('Volume up: Not implemented for musikcube (needs mpris-ctl)');
    }

    volumeDown() {
        console.log('Volume down: Not implemented for musikcube (needs mpris-ctl)');
    }

    setVolume(percent) {
        console.log(`Set volume to ${percent}%: Not implemented for musikcube (needs mpris-ctl)`);
    }

    mute() {
        console.log('Mute: Not implemented for musikcube (needs mpris-ctl)');
    }
}

module.exports = MusikcubeController;

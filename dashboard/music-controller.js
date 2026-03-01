#!/usr/bin/env node
/**
 * Music Control Module for System Dashboard
 * Supports: playerctl, mpc, mpd
 */

const { execSync } = require('child_process');

class MusicController {
    constructor() {
        this.detectPlayer();
    }

    detectPlayer() {
        // Try to detect which music player is available
        try {
            // Check for playerctl
            execSync('which playerctl', { stdio: 'ignore' });
            this.player = 'playerctl';
            this.type = 'cli';
        } catch {
            try {
                // Check for mpc (MPD client)
                execSync('which mpc', { stdio: 'ignore' });
                this.player = 'mpc';
                this.type = 'cli';
            } catch {
                this.player = null;
                this.type = 'none';
            }
        }

        console.log(`Detected player: ${this.player || 'none'}`);
    }

    getStatus() {
        if (!this.player) return this.getMockStatus();

        try {
            let output;
            if (this.player === 'playerctl') {
                output = execSync('playerctl status', { encoding: 'utf-8' });
                return this.parsePlayerctlStatus(output);
            } else if (this.player === 'mpc') {
                output = execSync('mpc status', { encoding: 'utf-8' });
                return this.parseMPCStatus(output);
            }
        } catch (error) {
            console.error('Error getting status:', error.message);
            return { error: error.message };
        }
    }

    parsePlayerctlStatus(output) {
        const lines = output.trim().split('\n');
        const status = { playing: false, artist: '', title: '', album: '', position: '', length: '', volume: 0 };

        // Parse status line
        if (lines[0]?.includes('Playing')) status.playing = true;

        // Parse metadata
        for (const line of lines) {
            if (line.includes('title')) status.title = line.split(':')[1]?.trim();
            if (line.includes('artist')) status.artist = line.split(':')[1]?.trim();
            if (line.includes('album')) status.album = line.split(':')[1]?.trim();
            if (line.includes('position')) status.position = line.split(':')[1]?.trim();
            if (line.includes('length')) status.length = line.split(':')[1]?.trim();
            if (line.includes('volume')) status.volume = parseInt(line.split(':')[1]?.trim()) || 0;
        }

        return status;
    }

    parseMPCStatus(output) {
        const lines = output.trim().split('\n');
        const status = { playing: false, artist: '', title: '', album: '', position: '', length: '', volume: 0 };

        // First line: status
        status.playing = lines[0]?.includes('playing');

        // Parse metadata
        for (const line of lines) {
            if (line.includes('artist:')) status.artist = line.split(':')[1]?.trim();
            if (line.includes('title:')) status.title = line.split(':')[1]?.trim();
            if (line.includes('album:')) status.album = line.split(':')[1]?.trim();
        }

        return status;
    }

    getMockStatus() {
        return {
            playing: false,
            artist: 'No Player',
            title: 'Install playerctl/mpc/mpd',
            album: 'System Offline',
            position: '0:00',
            length: '0:00',
            volume: 50
        };
    }

    // Control methods
    play() {
        if (!this.player) return;
        execSync(`${this.player} play`, { stdio: 'ignore' });
    }

    pause() {
        if (!this.player) return;
        execSync(`${this.player} pause`, { stdio: 'ignore' });
    }

    toggle() {
        if (!this.player) return;
        execSync(`${this.player} play-pause`, { stdio: 'ignore' });
    }

    next() {
        if (!this.player) return;
        execSync(`${this.player} next`, { stdio: 'ignore' });
    }

    previous() {
        if (!this.player) return;
        execSync(`${this.player} previous`, { stdio: 'ignore' });
    }

    setVolume(percent) {
        if (!this.player) return;
        execSync(`${this.player} volume ${Math.max(0, Math.min(100, percent))}%`, { stdio: 'ignore' });
    }

    volumeUp() {
        if (!this.player) return;
        execSync(`${this.player} volume +5%`, { stdio: 'ignore' });
    }

    volumeDown() {
        if (!this.player) return;
        execSync(`${this.player} volume -5%`, { stdio: 'ignore' });
    }

    mute() {
        if (!this.player) return;
        execSync(`${this.player} mute`, { stdio: 'ignore' });
    }
}

module.exports = MusicController;

#!/usr/bin/env node
/**
 * Simple music controller for musikcube
 * Tries to control musikcube using DBus/MPRIS
 */

const { execSync } = require('child_process');

// Helper function to get status via DBus
function getStatusWithDbus() {
    try {
        const statusCmd = execSync('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:org.mpris.MediaPlayer2.Player string:PlaybackStatus 2>/dev/null || echo "Stopped"', { encoding: 'utf-8' });
        const metadataCmd = execSync('dbus-send --print-reply --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:org.mpris.MediaPlayer2.Player string:Metadata 2>/dev/null || echo ""', { encoding: 'utf-8' });

        const isPlaying = statusCmd.includes('Playing') || statusCmd.includes('playing');
        const isPaused = statusCmd.includes('Paused') || statusCmd.includes('paused');

        // Parse metadata from DBus response
        let artist = 'Unknown';
        let title = 'No Track';
        let album = '';

        if (metadataCmd) {
            const lines = metadataCmd.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('xesam:artist')) {
                    artist = lines[i + 1]?.trim() || 'Unknown';
                }
                if (line.includes('xesam:title')) {
                    title = lines[i + 1]?.trim() || 'No Track';
                }
                if (line.includes('xesam:album')) {
                    album = lines[i + 1]?.trim() || '';
                }
            }
        }

        return {
            playing: isPlaying && !isPaused,
            artist,
            title,
            album
        };
    } catch (error) {
        return {
            playing: false,
            artist: 'Musikcube',
            title: 'Error connecting to Musikcube',
            album: error.message
        };
    }
}

// Detect player and return appropriate controller
function createController() {
    let available = false;
    let playerType = 'none';

    // Check if musikcube is installed
    try {
        execSync('which musikcube', { stdio: 'ignore' });
        console.log('✓ Musikcube terdeteksi');
        available = true;
        playerType = 'musikcube';
    } catch {
        console.log('✗ Musikcube tidak ditemukan');
    }

    // Return controller API
    return {
        available,
        playerType,

        getStatus: async () => {
            if (!available) {
                return {
                    playing: false,
                    artist: 'Musikcube',
                    title: 'Buka aplikasi Musikcube',
                    album: 'Player Terdeteksi'
                };
            }

            try {
                return await getStatusWithDbus();
            } catch (error) {
                console.error('Error getting status:', error.message);
                return {
                    playing: false,
                    artist: 'Musikcube',
                    title: 'Error',
                    album: error.message
                };
            }
        },

        play: () => {
            if (!available) return;
            try {
                execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Play 2>/dev/null', { stdio: 'ignore' });
            } catch (error) {
                console.error('Play error:', error.message);
            }
        },

        pause: () => {
            if (!available) return;
            try {
                execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Pause 2>/dev/null', { stdio: 'ignore' });
            } catch (error) {
                console.error('Pause error:', error.message);
            }
        },

        toggle: () => {
            if (!available) return;
            try {
                execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.PlayPause 2>/dev/null', { stdio: 'ignore' });
            } catch (error) {
                console.error('Toggle error:', error.message);
            }
        },

        next: () => {
            if (!available) return;
            try {
                execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Next 2>/dev/null', { stdio: 'ignore' });
            } catch (error) {
                console.error('Next error:', error.message);
            }
        },

        previous: () => {
            if (!available) return;
            try {
                execSync('dbus-send --dest=org.mpris.MediaPlayer2.musikcube /org/mpris/MediaPlayer2 org.mpris.MediaPlayer2.Player.Previous 2>/dev/null', { stdio: 'ignore' });
            } catch (error) {
                console.error('Previous error:', error.message);
            }
        },

        volumeUp: () => {
            console.log('Volume up: Not implemented for musikcube');
        },

        volumeDown: () => {
            console.log('Volume down: Not implemented for musikcube');
        },

        setVolume: (percent) => {
            console.log(`Set volume to ${percent}%: Not implemented for musikcube`);
        },

        mute: () => {
            console.log('Mute: Not implemented for musikcube');
        }
    };
}

module.exports = createController;

const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const createController = require('./musikcube-controller.js');

const PORT = 3000;
const musicController = createController();

// Serve static files
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    } else if (req.url === '/api/stats') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getSystemStats()));
    } else if (req.url.startsWith('/api/music/status')) {
        musicController.getStatus().then(status => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(status));
        }).catch(error => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });
    } else if (req.url.startsWith('/api/music/control')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const action = url.searchParams.get('action');
        const param = url.searchParams.get('param');

        try {
            switch(action) {
                case 'play': musicController.play(); break;
                case 'pause': musicController.pause(); break;
                case 'toggle': musicController.toggle(); break;
                case 'next': musicController.next(); break;
                case 'previous': musicController.previous(); break;
                case 'volume': musicController.setVolume(param); break;
                case 'volumeUp': musicController.volumeUp(); break;
                case 'volumeDown': musicController.volumeDown(); break;
                case 'mute': musicController.mute(); break;
                default: res.writeHead(400); res.end('Unknown action'); return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    } else if (req.url === '/style.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(fs.readFileSync(path.join(__dirname, 'style.css')));
    } else if (req.url === '/script.js') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(fs.readFileSync(path.join(__dirname, 'script.js')));
    } else if (req.url === '/music.js') {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(fs.readFileSync(path.join(__dirname, 'music.js')));
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

function getSystemStats() {
    try {
        // CPU Usage
        const cpuUsage = execSync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1", { encoding: 'utf-8' }).trim();
        
        // RAM Usage
        const ramInfo = execSync("free -m | awk 'NR==2{printf \"{\\\"total\\\":%d,\\\"used\\\":%d,\\\"available\\\":%d}\", $2,$3,$7}'", { encoding: 'utf-8' }).trim();
        const ramData = JSON.parse(ramInfo);
        ramData.percent = Math.round((ramData.used / ramData.total) * 100);
        
        // Storage Usage
        const storageInfo = execSync("df -h / | awk 'NR==2{printf \"{\\\"total\\\":\\\"%s\\\",\\\"used\\\":\\\"%s\\\",\\\"available\\\":\\\"%s\\\",\\\"percent\\\":\\\"%s\\\"}\", $2,$3,$4,$5}'", { encoding: 'utf-8' }).trim();
        const storageData = JSON.parse(storageInfo);
        storageData.percent = storageInfo.percent ? storageInfo.percent.replace('%', '') : '0';
        
        // Top RAM Apps
        const topApps = execSync("ps aux --sort=-%mem | awk 'NR>1 && NR<=11 {printf \"%s|%s|%s\\n\", $11, $4, $6}'", { encoding: 'utf-8' })
            .trim()
            .split('\n')
            .map(line => {
                const [name, percent, kb] = line.split('|');
                return {
                    name: name.substring(name.lastIndexOf('/') + 1).substring(0, 20),
                    percent: parseFloat(percent),
                    mb: Math.round(parseInt(kb) / 1024)
                };
            });
        
        // Temperature (if available)
        let temps = {};
        try {
            const tempData = execSync("sensors -j 2>/dev/null || echo '{}'", { encoding: 'utf-8' });
            temps = JSON.parse(tempData);
        } catch (e) {
            temps = {};
        }
        
        // Battery Info
        let battery = { status: 'Unknown', percent: 0, temp: 'N/A', health: 'Unknown' };
        try {
            const batteryInfo = execSync("upower -i /org/freedesktop/UPower/devices/battery_BAT0", { encoding: 'utf-8' });
            battery = {
                status: (batteryInfo.match(/state:\s+(.+)/) || [,'Unknown'])[1],
                percent: parseFloat((batteryInfo.match(/percentage:\s+(\d+\.?\d*)%?/) || [,'0'])[1]),
                temp: (batteryInfo.match(/temperature:\s+(.+)/) || [,'N/A'])[1],
                health: (batteryInfo.match(/capacity:\s+(.+)/) || [,'Unknown'])[1],
                cycles: (batteryInfo.match(/charge-cycles:\s+(.+)/) || [,'N/A'])[1],
                voltage: (batteryInfo.match(/voltage:\s+(.+)/) || [,'N/A'])[1]
            };
        } catch (e) {
            battery = { status: 'Not Available', percent: 0, temp: 'N/A', health: 'N/A' };
        }
        
        // Network Info
        let network = { type: 'Unknown', rx: '0 MB', tx: '0 MB' };
        try {
            // Check if WiFi or Ethernet
            const interfaces = execSync("ip link show | grep -E '(wlan|eth|enp|wlp)' | grep -v 'NO-CARRIER'", { encoding: 'utf-8' });
            network.type = interfaces.includes('wlan') || interfaces.includes('wlp') ? 'WiFi' : 'Ethernet';
            
            // Get network traffic
            const netStats = execSync("cat /proc/net/dev | grep -E '(wlan|eth|enp|wlp)' | awk '{printf \"{\\\"rx\\\":%s,\\\"tx\\\":%s}\", $2, $10}'", { encoding: 'utf-8' });
            const netData = JSON.parse(netStats);
            network.rx = (netData.rx / 1024 / 1024).toFixed(2) + ' MB';
            network.tx = (netData.tx / 1024 / 1024).toFixed(2) + ' MB';
        } catch (e) {
            network = { type: 'Unknown', rx: '0 MB', tx: '0 MB' };
        }
        
        return {
            cpu: {
                usage: parseFloat(cpuUsage) || 0
            },
            ram: ramData,
            storage: storageData,
            topApps: topApps,
            temperature: temps,
            battery: battery,
            network: network,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('Error getting stats:', error);
        return { error: error.message };
    }
}

server.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
    console.log(`Access from network: http://$(hostname -I | awk '{print $1}'):${PORT}`);
});

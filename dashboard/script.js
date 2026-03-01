// System Dashboard - Real-time Updates
let updateInterval;

// Update timestamp
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
    };
    
    const dateTimeString = now.toLocaleDateString('id-ID', options);
    document.getElementById('datetime').textContent = dateTimeString;
}

// Update CPU
function updateCPU(usage, bar) {
    document.getElementById('cpu-usage').textContent = usage + '%';
    document.getElementById('cpu-bar').style.width = usage + '%';
    
    // Color coding
    if (usage > 80) {
        document.getElementById('cpu-bar').style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    } else if (usage > 50) {
        document.getElementById('cpu-bar').style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    } else {
        document.getElementById('cpu-bar').style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    }
}

// Update RAM
function updateRAM(used, total, percent) {
    document.getElementById('ram-usage').textContent = `${used} / ${total} MB`;
    document.getElementById('ram-bar').style.width = percent + '%';
    document.getElementById('ram-percent').textContent = percent + '%';
    
    // Color coding
    if (percent > 80) {
        document.getElementById('ram-bar').style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    } else if (percent > 50) {
        document.getElementById('ram-bar').style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    }
}

// Update Storage
function updateStorage(used, total, percent) {
    document.getElementById('storage-usage').textContent = `${used} / ${total}`;
    document.getElementById('storage-bar').style.width = percent + '%';
    document.getElementById('storage-percent').textContent = percent + '%';
}

// Update Temperature
function updateTemp(temp) {
    document.getElementById('cpu-temp').textContent = temp + '°C';
    
    // Color coding
    if (temp > 80) {
        document.getElementById('cpu-temp').style.color = '#ef4444';
    } else if (temp > 60) {
        document.getElementById('cpu-temp').style.color = '#f59e0b';
    } else {
        document.getElementById('cpu-temp').style.color = '#10b981';
    }
}

// Update Battery
function updateBattery(battery) {
    if (!battery || battery.status === 'Not Available') {
        document.getElementById('battery-status').textContent = 'N/A';
        document.getElementById('battery-health').textContent = 'N/A';
        document.getElementById('battery-temp').textContent = 'N/A';
        document.getElementById('battery-cycles').textContent = 'N/A';
        document.getElementById('battery-percent').textContent = 'N/A';
        document.getElementById('battery-bar').style.width = '0%';
        return;
    }
    
    const percent = battery.percent || 0;
    const statusEmoji = battery.status === 'charging' || battery.status === 'fully-charged' ? '⚡' : '🔋';
    
    document.getElementById('battery-status').textContent = `${statusEmoji} ${battery.status}`;
    document.getElementById('battery-percent').textContent = percent + '%';
    document.getElementById('battery-bar').style.width = percent + '%';
    document.getElementById('battery-health').textContent = battery.health || 'Unknown';
    document.getElementById('battery-temp').textContent = battery.temp || 'N/A';
    document.getElementById('battery-cycles').textContent = battery.cycles || 'N/A';
    
    // Color coding
    if (percent > 50) {
        document.getElementById('battery-bar').style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    } else if (percent > 20) {
        document.getElementById('battery-bar').style.background = 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
    } else {
        document.getElementById('battery-bar').style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    }
}

// Update Network
function updateNetwork(network) {
    const icon = network.type === 'WiFi' ? '📶' : '🔌';
    document.getElementById('network-icon').textContent = icon;
    document.getElementById('network-type').textContent = network.type;
    document.getElementById('net-rx').textContent = network.rx;
    document.getElementById('net-tx').textContent = network.tx;
}

// Update Top Apps
function updateApps(apps) {
    const appsList = document.getElementById('apps-list');
    appsList.innerHTML = '';
    
    if (!apps || apps.length === 0) {
        appsList.innerHTML = '<div class="app-item loading">Loading...</div>';
        return;
    }
    
    apps.forEach((app, index) => {
        const item = document.createElement('div');
        item.className = 'app-item';
        
        const percent = (index + 1) * 10;
        const barColor = app.percent > 50 ? '#f59e0b' : '#10b981';
        
        item.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; flex:1;">
                <div style="font-weight:600; min-width:150px;">${app.name}</div>
                <div style="display:flex; align-items:center; gap:8px; flex:1;">
                    <div style="width:${app.percent}%; height:8px; background:${barColor}; border-radius:4px;"></div>
                    <span style="font-size:0.85rem; color:#94a3b8;">${app.percent}%</span>
                    <span style="font-size:0.8rem; color:#6c757d;">(${app.mb} MB)</span>
                </div>
            </div>
        `;
        
        appsList.appendChild(item);
    });
}

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active to clicked button
    event.target.classList.add('active');
}

// Fetch and update all stats
async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        if (stats.error) {
            console.error('Error:', stats.error);
            return;
        }
        
        // Update all metrics
        updateDateTime();
        updateCPU(stats.cpu.usage, 0);
        updateRAM(stats.ram.used, stats.ram.total, stats.ram.percent);
        updateStorage(stats.storage.used, stats.storage.total, stats.storage.percent);
        
        // Update temp (if available)
        if (stats.temperature && stats.temperature['coretemp'] !== undefined) {
            updateTemp(stats.temperature['coretemp']);
        }
        
        // Update battery
        updateBattery(stats.battery);
        
        // Update network
        updateNetwork(stats.network);
        
        // Update top apps
        updateApps(stats.topApps);
        
    } catch (error) {
        console.error('Failed to fetch stats:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    updateInterval = setInterval(fetchStats, 2000); // Update every 2 seconds
    
    // Auto-refresh every 5 minutes
    setTimeout(() => {
        location.reload();
    }, 5 * 60 * 1000);
});

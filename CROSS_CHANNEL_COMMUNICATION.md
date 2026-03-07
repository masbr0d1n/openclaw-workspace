# Cross-Channel Agent Communication

**Created:** 2026-03-07  
**Status:** ✅ Active

---

## 🎯 **Problem Statement**

Bagaimana agent di channel berbeda saling berkomunikasi padahal workspace terisolasi?

**Use Cases:**
- Backend API change → Notify frontend team
- Architecture decision → Share to all channels
- Critical bug → Alert relevant channels
- Shared knowledge → Sync across channels

---

## 🏗️ **Architecture**

### **Communication Methods**

| Method | Latency | Complexity | Use Case |
|--------|---------|------------|----------|
| **Shared Context** | Minutes | ⭐ Low | Knowledge sharing, decisions |
| **Message Board** | Seconds | ⭐⭐ Medium | Agent-to-agent messages |
| **Discord Messages** | Real-time | ⭐ Low | Urgent alerts, public notifications |
| **Sub-Agent Spawn** | Seconds | ⭐⭐⭐ High | Complex cross-channel tasks |
| **Database Queue** | Real-time | ⭐⭐⭐ High | High-volume messaging |

---

## 📦 **Solution 1: Message Board System** ⭐ RECOMMENDED

### **Overview**

File-based message queue untuk inter-agent communication.

```
/workspace/
└── .message-board/
    ├── {CHANNEL_ID}-{TIMESTAMP}.msg    # Pending messages
    └── .processed/                      # Archived messages
```

### **Message Format**

```json
{
  "version": "1.0",
  "from_channel": "1475383980353126402",
  "to_channel": "1475392569193140264",
  "timestamp": "2026-03-07T21:55:00+07:00",
  "priority": "normal",
  "requires_ack": false,
  "message": "API schema changed to v2",
  "status": "pending"
}
```

### **Usage**

**Send Message:**
```bash
# From agent in #general
bash /home/sysop/.openclaw/workspace/scripts/send-channel-message.sh \
  "1475392569193140264" \
  "API endpoint updated: /api/v1 → /api/v2"
```

**Check Messages:**
```bash
# From agent in #backend-dev
bash /home/sysop/.openclaw/workspace/scripts/check-channel-messages.sh \
  "1475392569193140264"
```

**Process Messages:**
```bash
# Auto-check on message receive
if [ -f ".message-board/${DISCORD_CHANNEL_ID}-*.msg" ]; then
    bash /home/sysop/.openclaw/workspace/scripts/check-channel-messages.sh \
      "$DISCORD_CHANNEL_ID"
    
    # Process each message
    for msg in .message-board/${DISCORD_CHANNEL_ID}-*.msg; do
        MESSAGE=$(jq -r '.message' "$msg")
        echo "Processing: $MESSAGE"
        
        # Take action based on message
        case "$MESSAGE" in
            *"API updated"*)
                echo "Updating API configuration..."
                ;;
            *"urgent"*)
                echo "Sending alert..."
                ;;
        esac
        
        # Archive message
        mv "$msg" ".message-board/.processed/"
    done
fi
```

---

## 📚 **Solution 2: Shared Context**

### **Overview**

Shared folder yang bisa diakses semua channel agents.

```
/workspace/
└── shared/
    ├── MEMORY.md              # Global knowledge
    ├── ANNOUNCEMENTS.md       # Channel announcements
    ├── DECISIONS.md           # Cross-channel decisions
    └── API_CONTRACTS.md       # Shared API specs
```

### **Usage**

**Write Announcement:**
```bash
cat >> /home/sysop/.openclaw/workspace/shared/ANNOUNCEMENTS.md << 'EOF'

## 2026-03-07: API Version Update
**From:** #general  
**To:** All channels  
**Priority:** High

API endpoint changed from `/api/v1` to `/api/v2`.

**Impact:**
- Frontend: Update API calls
- Backend: Deploy new version
- QA: Update test cases

**Timeline:**
- Deploy: 2026-03-08
- Deprecate v1: 2026-03-15
EOF
```

**Read Announcements:**
```bash
# Agent auto-load shared context
read /home/sysop/.openclaw/workspace/shared/ANNOUNCEMENTS.md

# Check for new updates since last check
git diff HEAD~1 shared/ANNOUNCEMENTS.md
```

---

## 💬 **Solution 3: Discord Messages**

### **Overview**

Send native Discord messages to other channels.

### **Usage**

**Send Message:**
```python
{
  "action": "send",
  "channel": "discord",
  "to": "channel:1475392569193140264",  # #backend-dev
  "message": "📢 API Update: Endpoint changed to /api/v2\n\n@backend-team please update your services."
}
```

**Broadcast to Multiple Channels:**
```python
{
  "action": "send",
  "channel": "discord",
  "targets": [
    "channel:1475392569193140264",  # #backend-dev
    "channel:1476052074415394938",  # #frontend-dev
    "channel:1479087649804521524"   # #qa-testing
  ],
  "message": "🚨 Breaking Change: API v2 deployed"
}
```

---

## 🤖 **Solution 4: Sub-Agent Messaging**

### **Overview**

Spawn sub-agent di target channel untuk complex tasks.

### **Usage**

**Spawn Sub-Agent:**
```python
{
  "action": "sessions_spawn",
  "task": "Notify backend team about API change and help them migrate",
  "label": "api-migration-helper",
  "mode": "session",
  "thread": true
}
```

**Send Message to Sub-Agent:**
```python
{
  "action": "sessions_send",
  "sessionKey": "api-migration-helper",
  "message": "Backend team has questions about the new API schema. Please help them."
}
```

**Check Status:**
```python
{
  "action": "sessions_list",
  "limit": 10
}
```

---

## 🗄️ **Solution 5: SQLite Message Queue**

### **Overview**

Database-backed message queue for reliability.

### **Schema**

```sql
CREATE TABLE agent_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_channel TEXT NOT NULL,
    to_channel TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_to_channel ON agent_messages(to_channel, status);
CREATE INDEX idx_status ON agent_messages(status);
```

### **Usage**

**Send Message:**
```python
import sqlite3

def send_message(from_channel, to_channel, message, priority='normal'):
    conn = sqlite3.connect('/home/sysop/.openclaw/workspace/agent_messages.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO agent_messages (from_channel, to_channel, message, priority)
        VALUES (?, ?, ?, ?)
    ''', (from_channel, to_channel, message, priority))
    
    conn.commit()
    conn.close()
    
    print(f"✅ Message sent to {to_channel}")

# Usage
send_message(
    "1475383980353126402",  # #general
    "1475392569193140264",  # #backend-dev
    "API v2 deployed",
    "high"
)
```

**Receive Messages:**
```python
def receive_messages(channel_id):
    conn = sqlite3.connect('/home/sysop/.openclaw/workspace/agent_messages.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, from_channel, message, priority, created_at
        FROM agent_messages
        WHERE to_channel = ? AND status = 'pending'
        ORDER BY created_at ASC
    ''', (channel_id,))
    
    messages = cursor.fetchall()
    
    for msg_id, from_ch, message, priority, created in messages:
        print(f"📨 From {from_ch} ({priority}): {message}")
        
        # Mark as delivered
        cursor.execute('''
            UPDATE agent_messages
            SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (msg_id,))
    
    conn.commit()
    conn.close()
    
    return messages
```

---

## 🎯 **Recommended Workflow**

### **Day-to-Day Communication**

**1. Shared Context (Primary)**
```bash
# For knowledge sharing, decisions, announcements
cat >> /home/sysop/.openclaw/workspace/shared/ANNOUNCEMENTS.md
```

**2. Message Board (Agent-to-Agent)**
```bash
# For direct agent communication
bash send-channel-message.sh <CHANNEL_ID> "<MESSAGE>"
```

**3. Discord Messages (Urgent)**
```python
# For urgent, visible notifications
message action=send channel=discord to=channel:ID message="🚨 URGENT"
```

---

## 📋 **Best Practices**

### **DO:**

- ✅ Use shared context for decisions that affect multiple channels
- ✅ Send message board messages for agent-to-agent communication
- ✅ Use Discord mentions for urgent human-visible alerts
- ✅ Archive processed messages
- ✅ Include timestamp and priority in messages
- ✅ Document cross-channel decisions in ADRs

### **DON'T:**

- ❌ Share sensitive info via public Discord messages
- ❌ Spam other channels with non-urgent messages
- ❌ Forget to clean up processed messages
- ❌ Assume other channel knows context - provide full info
- ❌ Use message board for large payloads (use shared files instead)

---

## 🔧 **Automation**

### **Auto-Check Messages on Startup**

Add to agent initialization:

```bash
# In agent startup script
if [ -n "$DISCORD_CHANNEL_ID" ]; then
    echo "📬 Checking for cross-channel messages..."
    bash /home/sysop/.openclaw/workspace/scripts/check-channel-messages.sh \
      "$DISCORD_CHANNEL_ID"
fi
```

### **Cron Job for Message Processing**

```bash
# Add to crontab
# Check messages every 5 minutes
*/5 * * * * bash /home/sysop/.openclaw/workspace/scripts/check-channel-messages.sh \
  1475392569193140264 >> /home/sysop/.openclaw/workspace/logs/cross-channel.log 2>&1
```

---

## 📊 **Message Templates**

### **API Change Notification**

```json
{
  "type": "api_change",
  "from_channel": "backend-dev",
  "to_channel": ["frontend-dev", "qa-testing"],
  "priority": "high",
  "message": "API endpoint changed: /api/v1/users → /api/v2/users",
  "details": {
    "old_path": "/api/v1/users",
    "new_path": "/api/v2/users",
    "breaking": true,
    "migration_guide": "/shared/API_MIGRATION_v2.md",
    "deadline": "2026-03-15"
  }
}
```

### **Architecture Decision**

```json
{
  "type": "architecture_decision",
  "from_channel": "software-architect",
  "to_channel": ["frontend-dev", "backend-dev"],
  "priority": "normal",
  "message": "ADR-001: Microservices architecture approved",
  "details": {
    "adr_number": "ADR-001",
    "status": "approved",
    "impact": "high",
    "document": "/shared/adr/ADR-001.md"
  }
}
```

### **Bug Alert**

```json
{
  "type": "bug_alert",
  "from_channel": "qa-testing",
  "to_channel": ["backend-dev"],
  "priority": "urgent",
  "message": "Critical bug in user authentication",
  "details": {
    "severity": "critical",
    "component": "auth-service",
    "error_rate": "15%",
    "ticket": "BUG-1234"
  }
}
```

---

## 🚀 **Quick Start**

**Setup:**
```bash
# 1. Create message board
mkdir -p /home/sysop/.openclaw/workspace/.message-board/.processed

# 2. Make scripts executable
chmod +x /home/sysop/.openclaw/workspace/scripts/send-channel-message.sh
chmod +x /home/sysop/.openclaw/workspace/scripts/check-channel-messages.sh

# 3. Test sending message
bash /home/sysop/.openclaw/workspace/scripts/send-channel-message.sh \
  "1475392569193140264" \
  "Test message from #general"

# 4. Test receiving messages
bash /home/sysop/.openclaw/workspace/scripts/check-channel-messages.sh \
  "1475392569193140264"
```

---

## 📚 **Related Documentation**

- [Multi-Channel Setup](./DISCORD_MULTI_CHANNEL_SETUP.md)
- [Channel Auto-Create](./DISCORD_CHANNEL_AUTO_CREATE.md)
- [Software Architect Setup](./discord/channels/software-architect/SOUL.md)

---

**Last Updated:** 2026-03-07  
**Status:** ✅ Production Ready

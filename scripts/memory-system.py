#!/usr/bin/env python3
"""
OpenClaw Memory System - SQLite backed
Sync MEMORY.md files to SQLite database for persistence and querying
"""

import sqlite3
import os
from pathlib import Path
from datetime import datetime
import json
import hashlib

DB_PATH = "/home/sysop/.openclaw/workspace/memory.db"
WORKSPACE = "/home/sysop/.openclaw/workspace"

class MemoryDB:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.create_tables()

    def create_tables(self):
        """Create database tables"""
        cursor = self.conn.cursor()

        # Shared memory table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS shared_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Channel memory table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS channel_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id TEXT,
                key TEXT,
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(channel_id, key)
            )
        """)

        # Daily logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date)
            )
        """)

        # Search index (FTS5)
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS memory_search
            USING fts5(content, table_name, row_id)
        """)

        self.conn.commit()

    def save_shared_memory(self, key, content):
        """Save shared memory entry"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO shared_memory (key, content, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (key, content))

        # Get the row ID
        row_id = cursor.lastrowid

        # Update search index
        try:
            cursor.execute("""
                INSERT INTO memory_search (rowid, content, table_name)
                VALUES (?, ?, 'shared_memory')
            """, (row_id, content))
        except sqlite3.IntegrityError:
            # Update existing entry
            cursor.execute("""
                UPDATE memory_search SET content = ?
                WHERE rowid = ? AND table_name = 'shared_memory'
            """, (content, row_id))

        self.conn.commit()
        return row_id

    def save_channel_memory(self, channel_id, key, content):
        """Save channel-specific memory entry"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO channel_memory (channel_id, key, content, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        """, (channel_id, key, content))

        # Get the row ID
        row_id = cursor.lastrowid

        # Update search index
        try:
            cursor.execute("""
                INSERT INTO memory_search (rowid, content, table_name)
                VALUES (?, ?, 'channel_memory')
            """, (row_id, content))
        except sqlite3.IntegrityError:
            # Update existing entry
            cursor.execute("""
                UPDATE memory_search SET content = ?
                WHERE rowid = ? AND table_name = 'channel_memory'
            """, (content, row_id))

        self.conn.commit()
        return row_id

    def save_daily_log(self, date, content):
        """Save daily log entry"""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO daily_logs (date, content, created_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (date, content))

        # Get the row ID
        row_id = cursor.lastrowid

        # Update search index
        try:
            cursor.execute("""
                INSERT INTO memory_search (rowid, content, table_name)
                VALUES (?, ?, 'daily_logs')
            """, (row_id, content))
        except sqlite3.IntegrityError:
            # Update existing entry
            cursor.execute("""
                UPDATE memory_search SET content = ?
                WHERE rowid = ? AND table_name = 'daily_logs'
            """, (content, row_id))

        self.conn.commit()
        return row_id

    def search(self, query, limit=10):
        """Search across all memory"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT table_name, rowid, content, snippet(memory_search, 2, '[[', ']]', '...', 30) as snippet
            FROM memory_search
            WHERE memory_search MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (query, limit))
        return cursor.fetchall()

    def get_shared_memory(self, key):
        """Get shared memory entry"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT content FROM shared_memory WHERE key = ?", (key,))
        row = cursor.fetchone()
        return row['content'] if row else None

    def get_channel_memory(self, channel_id, key):
        """Get channel memory entry"""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT content FROM channel_memory
            WHERE channel_id = ? AND key = ?
        """, (channel_id, key))
        row = cursor.fetchone()
        return row['content'] if row else None

    def export_to_markdown(self, output_path):
        """Export database to markdown files"""
        # Export shared memory
        shared_path = Path(output_path) / "shared"
        shared_path.mkdir(parents=True, exist_ok=True)

        cursor = self.conn.cursor()
        cursor.execute("SELECT key, content FROM shared_memory")
        for row in cursor.fetchall():
            (shared_path / f"{row['key']}.md").write_text(row['content'])

        # Export channel memory
        channel_path = Path(output_path) / "discord" / "channels"
        channel_path.mkdir(parents=True, exist_ok=True)

        cursor.execute("SELECT DISTINCT channel_id FROM channel_memory")
        for row in cursor.fetchall():
            channel_dir = channel_path / row['channel_id']
            channel_dir.mkdir(parents=True, exist_ok=True)

            cursor2 = self.conn.cursor()
            cursor2.execute("""
                SELECT key, content FROM channel_memory
                WHERE channel_id = ?
            """, (row['channel_id'],))

            for row2 in cursor2.fetchall():
                (channel_dir / f"{row2['key']}.md").write_text(row2['content'])

    def backup(self, backup_path):
        """Backup database to file"""
        import shutil
        shutil.copy2(self.db_path, backup_path)
        return backup_path

    def close(self):
        """Close database connection"""
        self.conn.close()

def sync_files_to_db():
    """Sync MEMORY.md files to database"""
    db = MemoryDB()

    # Sync shared memory files
    shared_dir = Path(WORKSPACE) / "shared"
    if shared_dir.exists():
        for md_file in shared_dir.glob("*.md"):
            key = md_file.stem
            content = md_file.read_text()
            db.save_shared_memory(key, content)
            print(f"✅ Synced: shared/{key}.md")

    # Sync channel memory files
    channels_dir = Path(WORKSPACE) / "discord" / "channels"
    if channels_dir.exists():
        for channel_dir in channels_dir.iterdir():
            if channel_dir.is_dir():
                channel_id = channel_dir.name
                for md_file in channel_dir.glob("*.md"):
                    key = md_file.stem
                    content = md_file.read_text()
                    db.save_channel_memory(channel_id, key, content)
                    print(f"✅ Synced: discord/channels/{channel_id}/{key}.md")

    # Sync daily logs
    memory_dir = Path(WORKSPACE) / "memory"
    if memory_dir.exists():
        for md_file in memory_dir.glob("*.md"):
            date = md_file.stem
            content = md_file.read_text()
            db.save_daily_log(date, content)
            print(f"✅ Synced: memory/{date}.md")

    db.close()
    print(f"\n✅ Sync complete! Database: {DB_PATH}")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "sync":
        sync_files_to_db()
    elif len(sys.argv) > 1 and sys.argv[1] == "search":
        if len(sys.argv) < 3:
            print("Usage: python memory-system.py search '<query>'")
            sys.exit(1)
        db = MemoryDB()
        results = db.search(sys.argv[2])
        print(f"\n🔍 Search results for: {sys.argv[2]}\n")
        for row in results:
            print(f"[{row['table_name']}] {row['snippet']}\n")
        db.close()
    elif len(sys.argv) > 1 and sys.argv[1] == "backup":
        db = MemoryDB()
        backup_file = f"/home/sysop/ssd/backups/openclaw/memory_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        db.backup(backup_file)
        print(f"✅ Database backed up to: {backup_file}")
        db.close()
    else:
        print("OpenClaw Memory System")
        print("Usage:")
        print("  python memory-system.py sync      - Sync MEMORY.md files to database")
        print("  python memory-system.py search Q  - Search memory")
        print("  python memory-memory.py backup    - Backup database")
        sys.exit(0)

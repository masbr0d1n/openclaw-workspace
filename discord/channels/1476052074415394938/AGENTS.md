# AGENTS.md - Channel #frontend-dev

## Channel Workflow

1. **Load Context:**
   - Read shared/MEMORY.md (global context)
   - Read discord/channels/1476052074415394938/MEMORY.md (channel context)

2. **Process Message:**
   - Understand user request
   - Check channel-specific rules
   - Apply specialized knowledge

3. **Save Updates:**
   - Channel decisions → discord/channels/1476052074415394938/MEMORY.md
   - Global updates → shared/MEMORY.md

4. **Commit Changes:**
   - Run: bash /home/sysop/.openclaw/workspace/commit-workspace.sh

## Channel Rules

- Keep discussions relevant to #frontend-dev
- Save channel-specific context to channel MEMORY.md
- Use shared context for global information

# Diagram Conversion Instructions

## Files Created:
All 8 Mermaid diagram files have been created in: `/home/sysop/.openclaw/workspace/diagrams/`

### Diagram Files:
1. `01-simple-cache.mmd` - Simple Cache Architecture (LEVEL 1)
2. `02-multi-tier.mmd` - Multi-Tier Architecture (LEVEL 2)
3. `03-production-ready.mmd` - Production-Ready Architecture (LEVEL 3)
4. `04-hybrid-setup.mmd` - Hybrid Setup (RPi + M1 Pro)
5. `05-rag-pipeline.mmd` - Full RAG Pipeline Flow
6. `06-queue-flow.mmd` - Request Flow with Queue
7. `07-document-upload.mmd` - Document Upload Flow
8. `08-comparison-matrix.mmd` - Architecture Comparison Matrix

## How to Convert to PNG/JPG:

### Option 1: Online (Easiest)
1. Go to https://mermaid.live
2. Copy and paste each .mmd file content
3. Click "Download PNG" or "Download SVG"

### Option 2: Mermaid Ink (Direct URL)
Use this format for direct image URLs:
```
https://mermaid.ink/img/<base64_encoded_mermaid>
```

Encode your mermaid code to base64 and replace `<base64_encoded_mermaid>`

### Option 3: Command Line (Docker)
```bash
cd /home/sysop/.openclaw/workspace/diagrams

# Install mermaid-cli via Docker
docker pull minlag/mermaid-cli

# Convert single file
docker run --rm -v $(pwd):/data minlag/mermaid-cli \
  -i /data/01-simple-cache.mmd \
  -o /data/output/01-simple-cache.png \
  -b white -s 2

# Convert all files
mkdir -p output
for file in *.mmd; do
  filename=$(basename "$file" .mmd)
  docker run --rm -v $(pwd):/data minlag/mermaid-cli \
    -i /data/$filename.mmd \
    -o /data/output/$filename.png \
    -b white -s 2
done
```

### Option 4: VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open .mmd file
3. Right-click → "Mermaid: Export to PNG/SVG"

### Option 5: Python (requires packages)
```bash
pip install mermaid-python
```

```python
from mermaid_python import Mermaid

# Read and convert
with open('01-simple-cache.mmd', 'r') as f:
    mermaid_code = f.read()

m = Mermaid(mermaid_code)
m.to_file('output/01-simple-cache.png')
```

## Quick Test (One-Liner)

Test a single diagram online:
```bash
# Encode to base64 and open in browser
echo "graph LR
    A[Start] --> B[End]" | base64 | xargs -I {} echo "https://mermaid.ink/img/{}"
```

## Recommended: Use Mermaid Live
Fastest option: https://mermaid.live
- Copy each .mmd file
- Paste into editor
- Download as PNG/SVG with custom settings (scale, background, etc.)

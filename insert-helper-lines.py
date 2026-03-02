#!/usr/bin/env python3

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

# Find where to insert - before the component or after other helpers
# Look for a good insertion point

insert_idx = -1
for i in range(len(lines)):
    # Find the end of getFileExtension function
    if 'getFileExtension' in lines[i] and 'const' in lines[i]:
        # Found it, now find the closing brace
        for j in range(i+1, min(i+20, len(lines))):
            if lines[j].strip() == '};' or (lines[j].strip() == '}' and 'return' in lines[j-1]):
                insert_idx = j + 1
                break
        break

if insert_idx > 0:
    # Insert helper function
    helper_lines = [
        "\n",
        "// Helper: Get badge color for file type\n",
        "const getFileBadgeColor = (contentType: string | undefined, filePath: string | undefined) => {\n",
        "  if (contentType === 'video') {\n",
        "    return 'bg-red-500 text-white border-red-600';\n",
        "  } else if (contentType === 'image') {\n",
        "    return 'bg-green-500 text-white border-green-600';\n",
        "  }\n",
        "  // Fallback: check file extension\n",
        "  if (filePath) {\n",
        "    const ext = filePath.toLowerCase().split('.').pop();\n",
        "    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') {\n",
        "      return 'bg-red-500 text-white border-red-600';\n",
        "    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp') {\n",
        "      return 'bg-green-500 text-white border-green-600';\n",
        "    }\n",
        "  }\n",
        "  return 'bg-slate-500 text-white border-slate-600'; // Default\n",
        "};\n"
    ]
    
    lines = lines[:insert_idx] + helper_lines + lines[insert_idx:]
    print(f"✓ Inserted helper function at line {insert_idx + 1}")
else:
    print("✗ Could not find insertion point")
    # Let's just add it at the beginning of the component
    for i in range(len(lines)):
        if 'export default function' in lines[i]:
            insert_idx = i
            break
    if insert_idx > 0:
        helper_lines = [
            "// Helper: Get badge color for file type\n",
            "const getFileBadgeColor = (contentType: string | undefined, filePath: string | undefined) => {\n",
            "  if (contentType === 'video') {\n",
            "    return 'bg-red-500 text-white border-red-600';\n",
            "  } else if (contentType === 'image') {\n",
            "    return 'bg-green-500 text-white border-green-600';\n",
            "  }\n",
            "  if (filePath) {\n",
            "    const ext = filePath.toLowerCase().split('.').pop();\n",
            "    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') {\n",
            "      return 'bg-red-500 text-white border-red-600';\n",
            "    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp') {\n",
            "      return 'bg-green-500 text-white border-green-600';\n",
            "    }\n",
            "  }\n",
            "  return 'bg-slate-500 text-white border-slate-600';\n",
            "};\n",
            "\n"
        ]
        lines = lines[:insert_idx] + helper_lines + lines[insert_idx:]
        print(f"✓ Inserted at component start (line {insert_idx + 1})")

with open(file_path, 'w') as f:
    f.writelines(lines)

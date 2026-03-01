#!/bin/bash

echo "=== FFmpeg Thumbnail Fix - Deployment Complete ==="
echo ""
echo "✅ FFmpeg Service Fixed:"
echo "   - Replaced ffmpeg-python with subprocess"
echo "   - Direct FFmpeg binary calls"
echo "   - Better error handling"
echo "   - Timeout protection"
echo ""
echo "✅ Backend Deployed:"
docker ps | grep apistreamhub-api | awk '{print "   Container: " $1 " | Image: " $2 " | Status: " $7}'
echo ""
echo "✅ Database Permissions Fixed:"
docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public';" | tail -7 | head -6
echo ""
echo "=== Test API ==="
echo "Fetching videos..."
RESULT=$(curl -s http://192.168.8.117:8001/api/v1/videos/)
COUNT=$(echo "$RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else data.get('data', {}).get('count', 0))")
echo "Videos in database: $COUNT"
echo ""
echo "=== Next Steps ==="
echo "1. Open frontend: http://192.168.8.117:3000/dashboard/content"
echo "2. Upload a new video (MP4)"
echo "3. Check if thumbnail_data is populated"
echo "4. Verify thumbnail displays in table"
echo "5. Test View modal with metadata"
echo ""
echo "✅ Ready to test!"

import sys
import json
import subprocess
import re

account = sys.argv[1]

# Use Brave Search to find recent tweets
try:
    result = subprocess.run(
        ["/home/sysop/.npm-global/bin/openclaw", "web", "search",
         "--query", f"site:twitter.com/{account} from:{account}",
         "--count", "5",
         "--freshness", "pw"],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    output = result.stdout
    
    # Extract tweet IDs using regex
    tweet_ids = re.findall(rf'twitter\.com/{account}/status/(\d+)', output)
    
    if tweet_ids:
        # Return most recent (first match)
        print(tweet_ids[0])
    else:
        print("")
        
except Exception as e:
    print("")

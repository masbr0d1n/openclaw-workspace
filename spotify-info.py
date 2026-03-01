#!/usr/bin/env python3
"""
Spotify Album Info Extractor
Extracts album name and artist from Spotify URL without API
"""
import sys
import re
import requests
from bs4 import BeautifulSoup

def get_spotify_album_info(spotify_url):
    """Extract album name and artist from Spotify URL"""
    try:
        # Fetch HTML page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(spotify_url, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # Try to find album name and artist from title or meta tags
        title = soup.find('title')
        if title:
            # Title usually in format: "Album Name - Artist Name | Spotify"
            title_text = title.get_text()
            match = re.match(r'(.+?) - (.+?) \| Spotify', title_text)
            if match:
                album_name = match.group(1).strip()
                artist_name = match.group(2).strip()
                return {
                    'album': album_name,
                    'artist': artist_name,
                    'success': True
                }

        # Try meta tags
        og_title = soup.find('meta', property='og:title')
        if og_title:
            content = og_title.get('content', '')
            parts = content.split(' - ')
            if len(parts) >= 2:
                return {
                    'album': parts[0].strip(),
                    'artist': parts[1].strip(),
                    'success': True
                }

        return {
            'success': False,
            'error': 'Could not parse album info from page'
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 spotify-info.py <spotify_url>")
        sys.exit(1)

    url = sys.argv[1]
    info = get_spotify_album_info(url)

    if info['success']:
        print(f"{info['album']}|{info['artist']}")
    else:
        print(f"ERROR|{info.get('error', 'Unknown error')}")
        sys.exit(1)

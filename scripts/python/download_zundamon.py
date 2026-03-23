import urllib.request
import json
import ssl
import urllib.parse
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Using URL encoded title for "ずんだもん" to avoid encoding issues in script literals
title = urllib.parse.quote('\u305a\u3093\u3060\u3082\u3093')
url = f'https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles={title}&pithumbsize=1000'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    response = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
    data = json.loads(response)
    pages = data['query']['pages']
    for page_id in pages:
        if 'thumbnail' in pages[page_id]:
            img_url = pages[page_id]['thumbnail']['source']
            print('Downloading', img_url)
            img_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(img_req, context=ctx) as img_res, open(r'c:\Users\hirom\ai-game-platform\public\zundamon.png', 'wb') as out_file:
                out_file.write(img_res.read())
            print('Success.')
        else:
            print('No thumbnail found on ja.wikipedia')
except Exception as e:
    print('Failed:', e)
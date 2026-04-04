import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

def iter_urls(resolver, prefix=''):
    for pattern in resolver.url_patterns:
        if isinstance(pattern, URLPattern):
            yield f"/{prefix}{str(pattern.pattern)}"
        elif isinstance(pattern, URLResolver):
            yield from iter_urls(pattern, prefix + str(pattern.pattern))

resolver = get_resolver()
urls = sorted(set(iter_urls(resolver)))

artifact_path = r"C:\Users\DELL\.gemini\antigravity\brain\3d75c0d5-ec82-4df8-ae69-1688d61d7037\existing_endpoints.md"

# Format into logical groups
grouped_urls = {}
for url in urls:
    parts = url.strip('/').split('/')
    if len(parts) > 1 and parts[0] == 'api':
        group = parts[1]
    else:
        group = 'other'
    
    if group not in grouped_urls:
        grouped_urls[group] = []
    grouped_urls[group].append(url)

with open(artifact_path, "w") as f:
    f.write("# Existing API Endpoints\n\n")
    f.write("Here is the complete list of all existing endpoints currently registered in the backend, grouped by logical resources:\n\n")
    
    for group in sorted(grouped_urls.keys()):
        f.write(f"### {group.capitalize()}\n")
        f.write("```text\n")
        for url in grouped_urls[group]:
            f.write(f"{url}\n")
        f.write("```\n\n")

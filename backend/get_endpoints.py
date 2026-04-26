import os
import sys
import django
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def get_all_urls(resolver, prefix=''):
    urls = []
    for pattern in resolver.url_patterns:
        if hasattr(pattern, 'url_patterns'):
            urls.extend(get_all_urls(pattern, prefix + str(pattern.pattern)))
        else:
            urls.append(prefix + str(pattern.pattern))
    return urls

urls = get_all_urls(get_resolver())
for url in sorted(set(urls)):
    print(f"/{url}")

async function testScraping() {
  const urls = [
    { platform: 'Facebook', url: 'https://www.facebook.com/watch/?v=10158784378129871' },
    { platform: 'Twitter', url: 'https://x.com/SpaceX/status/1789456123456789012' },
    { platform: 'Threads', url: 'https://www.threads.net/@creator/post/C3x9zP1LXyq' },
  ];

  for (const item of urls) {
    try {
      console.log(`\nFetching ${item.platform}: ${item.url}`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        },
      });
      console.log('Status:', res.status);
      const text = await res.text();
      const ogTitle = text.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const ogImage = text.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      const ogVideo = text.match(/<meta\s+property=["']og:video(:secure_url)?["']\s+content=["']([^"']+)["']/i);
      console.log('og:title:', ogTitle ? ogTitle[1] : 'NONE');
      console.log('og:image:', ogImage ? ogImage[1] : 'NONE');
      console.log('og:video:', ogVideo ? ogVideo[2] || ogVideo[1] : 'NONE');
    } catch (e: any) {
      console.log('Error:', e.message);
    }
  }
}

testScraping();

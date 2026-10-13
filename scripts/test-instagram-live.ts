async function testLiveInstagram() {
  const shortcode = 'C3x9zP1LXyq';
  const canonicalUrl = `https://www.instagram.com/p/${shortcode}/`;

  console.log('Testing oEmbed for:', canonicalUrl);
  try {
    const oembedRes = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(canonicalUrl)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    console.log('oEmbed status:', oembedRes.status);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      console.log('oEmbed data:', data);
    } else {
      console.log('oEmbed text:', await oembedRes.text());
    }
  } catch (e: any) {
    console.error('oEmbed error:', e?.message);
  }

  console.log('\nTesting embed/captioned for:', canonicalUrl);
  try {
    const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
      },
    });
    console.log('embed status:', embedRes.status);
    if (embedRes.ok) {
      const html = await embedRes.text();
      console.log('embed length:', html.length);
      const videoMatch = html.match(/video_url["']:\s*["']([^"']+)["']/i) ||
                         html.match(/<video[^>]+src=["']([^"']+)["']/i) ||
                         html.match(/property=["']og:video["']\s+content=["']([^"']+)["']/i);
      console.log('videoMatch found:', !!videoMatch);
      if (videoMatch) {
        console.log('videoMatch url:', videoMatch[1].slice(0, 100));
      }
      const imgMatch = html.match(/display_url["']:\s*["']([^"']+)["']/i) ||
                       html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
      console.log('imgMatch found:', !!imgMatch);
      if (imgMatch) {
        console.log('imgMatch url:', imgMatch[1].slice(0, 100));
      }
    }
  } catch (e: any) {
    console.error('embed error:', e?.message);
  }
}

testLiveInstagram();

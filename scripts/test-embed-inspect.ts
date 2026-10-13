async function inspectEmbedHtml() {
  const shortcode = 'C3x9zP1LXyq';
  const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://www.instagram.com/',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const html = await embedRes.text();
  console.log('HTML preview (first 500 chars):', html.slice(0, 500));
  
  // Search for .mp4 or cdn or scontent or shortcode in HTML
  const mp4Matches = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi);
  console.log('mp4Matches:', mp4Matches ? mp4Matches.length : 0);
  if (mp4Matches) {
    console.log('First 3 mp4:', mp4Matches.slice(0, 3));
  }

  const scontentMatches = html.match(/https?:\/\/[^"'\s]*scontent[^"'\s]*/gi);
  console.log('scontentMatches:', scontentMatches ? scontentMatches.length : 0);
  if (scontentMatches) {
    console.log('First 3 scontent:', scontentMatches.slice(0, 3));
  }

  // Look for JSON script tags
  const jsonMatches = html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi);
  console.log('jsonMatches:', jsonMatches ? jsonMatches.length : 0);
  if (jsonMatches) {
    for (const tag of jsonMatches.slice(0, 5)) {
      console.log('Script tag content preview:', tag.slice(0, 300));
    }
  }

  // Look for Window.__additionalDataLoaded
  const addData = html.match(/__additionalDataLoaded\('([^']+)',\s*({[\s\S]*?})\);/);
  console.log('__additionalDataLoaded found:', !!addData);
}

inspectEmbedHtml();

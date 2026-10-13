async function testSocialEndpoints() {
  console.log('Testing Facebook, Twitter, Threads endpoints...');

  // Facebook oembed
  try {
    const fbUrl = 'https://www.facebook.com/watch/?v=10158784378129871';
    const fbRes = await fetch(`https://www.facebook.com/plugins/video/oembed.json/?url=${encodeURIComponent(fbUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    console.log('FB oEmbed status:', fbRes.status);
    if (fbRes.ok) {
      console.log('FB oEmbed data:', await fbRes.json());
    }
  } catch (e: any) {
    console.log('FB oEmbed err:', e.message);
  }

  // Twitter oembed
  try {
    const twUrl = 'https://x.com/SpaceX/status/1789456123456789012';
    const twRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(twUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    console.log('Twitter oEmbed status:', twRes.status);
    if (twRes.ok) {
      console.log('Twitter oEmbed data:', await twRes.json());
    }
  } catch (e: any) {
    console.log('Twitter oEmbed err:', e.message);
  }

  // Threads oembed
  try {
    const thUrl = 'https://www.threads.net/@creator/post/C3x9zP1LXyq';
    const thRes = await fetch(`https://www.threads.net/oembed?url=${encodeURIComponent(thUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    console.log('Threads oEmbed status:', thRes.status);
    if (thRes.ok) {
      console.log('Threads oEmbed data:', await thRes.json());
    }
  } catch (e: any) {
    console.log('Threads oEmbed err:', e.message);
  }
}

testSocialEndpoints();

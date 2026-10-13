import { extractorRegistry } from '../services/platforms/registry';
import { tokenService } from '../services/download/token-service';

async function testAllPlatforms() {
  const testUrls = [
    { name: 'YouTube A', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { name: 'YouTube B', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
    { name: 'Instagram A', url: 'https://www.instagram.com/reel/C3x9zP1LXyq/' },
    { name: 'Instagram B', url: 'https://www.instagram.com/p/DB8K012ABCD/' },
    { name: 'TikTok A', url: 'https://www.tiktok.com/@tiktok/video/7106594312292453678' },
    { name: 'TikTok B', url: 'https://www.tiktok.com/@creator/video/7234567890123456789' },
    { name: 'Facebook A', url: 'https://www.facebook.com/watch/?v=10158784378129871' },
    { name: 'Facebook B', url: 'https://www.facebook.com/watch/?v=20249876543210987' },
    { name: 'Twitter A', url: 'https://x.com/SpaceX/status/1789456123456789012' },
    { name: 'Twitter B', url: 'https://x.com/NASA/status/1789456123456789099' },
    { name: 'Vimeo A', url: 'https://vimeo.com/76979871' },
    { name: 'Vimeo B', url: 'https://vimeo.com/1084537' },
    { name: 'Threads A', url: 'https://www.threads.net/@creator/post/C3x9zP1LXyq' },
    { name: 'Threads B', url: 'https://www.threads.net/@another/post/DF9xK34WXYZ' },
    { name: 'Generic MP4 A', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  ];

  console.log('=== MULTI-PLATFORM EXTRACTION & DOWNLOAD AUDIT ===\n');

  for (const item of testUrls) {
    console.log(`--- Testing [${item.name}]: ${item.url} ---`);
    const extractRes = await extractorRegistry.extract(item.url);
    console.log('Extract Success:', extractRes.success);
    if (!extractRes.success) {
      console.log('Extract Error:', extractRes.error);
      console.log('Extract Code:', extractRes.code);
      continue;
    }

    const data = extractRes.data!;
    console.log('Platform:', data.platform);
    console.log('Media ID:', data.mediaId);
    console.log('Canonical URL:', data.canonicalUrl);
    console.log('Title:', data.title);
    console.log('Thumbnail:', data.thumbnail);
    console.log('Formats Count:', data.formats?.length);

    for (const f of data.formats || []) {
      console.log(`  Format [${f.id}]:`);
      console.log(`    ext: ${f.ext}, quality: ${f.quality}`);
      console.log(`    directStreamUrl: ${f.directStreamUrl || 'NONE'}`);
      if (f.token) {
        const payload = tokenService.decodePayloadWithoutVerification(f.token);
        console.log(`    Token mediaId: ${payload?.mediaId}, formatId: ${payload?.formatId}, directMediaUrl: ${payload?.directMediaUrl || 'NONE'}`);
      }
    }
  }
}

testAllPlatforms().catch(console.error);

import { extractorRegistry } from '../services/platforms/registry';
import { mediaCache } from '../services/cache/media-cache';
import { EXACT_MEDIA_ERROR_MESSAGE } from '../services/platforms/types';

async function runExtractorTests() {
  console.log('====================================================');
  console.log('STARTING MEDIA EXTRACTION & EXACT-MATCHING VERIFICATION');
  console.log('====================================================\n');

  mediaCache.clear();
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      process.exitCode = 1;
    }
  }

  // ==========================================
  // 1. INSTAGRAM EXACT URL → EXACT MEDIA TESTS
  // ==========================================
  console.log('--- 1. Testing Instagram URLs ---');
  const igUrlA = 'https://www.instagram.com/reel/C3x9zP1LXyq/';
  const igUrlB = 'https://www.instagram.com/p/DB8K012ABCD/?igsh=MWx_tracking_code_123';
  const igUrlC = 'https://www.instagram.com/share/r/DF9xK34WXYZ/';

  const resIgA = await extractorRegistry.extract(igUrlA);
  assert(resIgA.success === true, 'Instagram URL A extracts successfully');
  assert(resIgA.data?.mediaId === 'C3x9zP1LXyq', 'Instagram URL A returns exact mediaId C3x9zP1LXyq');
  assert(resIgA.data?.canonicalUrl === 'https://www.instagram.com/p/C3x9zP1LXyq/', 'Instagram URL A canonicalUrl matches exact ID');
  assert(Boolean(resIgA.data?.formats[0]?.downloadUrl?.includes('C3x9zP1LXyq')), 'Instagram URL A format downloadUrl points to C3x9zP1LXyq');

  const resIgB = await extractorRegistry.extract(igUrlB);
  assert(resIgB.success === true, 'Instagram URL B extracts successfully');
  assert(resIgB.data?.mediaId === 'DB8K012ABCD', 'Instagram URL B returns exact mediaId DB8K012ABCD');
  assert(resIgB.data?.canonicalUrl === 'https://www.instagram.com/p/DB8K012ABCD/', 'Instagram URL B canonicalUrl matches exact ID');

  const resIgC = await extractorRegistry.extract(igUrlC);
  assert(resIgC.success === true, 'Instagram URL C extracts successfully');
  assert(resIgC.data?.mediaId === 'DF9xK34WXYZ', 'Instagram URL C returns exact mediaId DF9xK34WXYZ');

  // Verify Non-cross contamination
  assert(resIgA.data?.mediaId !== resIgB.data?.mediaId, 'Instagram A never returns B');
  assert(resIgB.data?.mediaId !== resIgC.data?.mediaId, 'Instagram B never returns C');
  assert(resIgA.data?.mediaId !== resIgC.data?.mediaId, 'Instagram A never returns C');

  // Verify Cache Isolation for Instagram
  const resIgACached = await extractorRegistry.extract(igUrlA);
  assert(resIgACached.data?.mediaId === 'C3x9zP1LXyq', 'Instagram URL A cached result returns exact video A');
  const resIgBCached = await extractorRegistry.extract(igUrlB);
  assert(resIgBCached.data?.mediaId === 'DB8K012ABCD', 'Instagram URL B cached result returns exact video B');

  // ==========================================
  // 2. TIKTOK EXACT URL → EXACT MEDIA TESTS
  // ==========================================
  console.log('\n--- 2. Testing TikTok URLs ---');
  const ttUrlA = 'https://www.tiktok.com/@creator1/video/7234567890123456789';
  const ttUrlB = 'https://www.tiktok.com/@creator2/video/7345678901234567890?_r=1&_t=8lkj&is_from_webapp=1';
  const ttUrlC = 'https://www.tiktok.com/@creator3/video/7456789012345678901';

  const resTtA = await extractorRegistry.extract(ttUrlA);
  assert(resTtA.success === true, 'TikTok URL A extracts successfully');
  assert(resTtA.data?.mediaId === '7234567890123456789', 'TikTok URL A returns exact mediaId 7234567890123456789');
  assert(resTtA.data?.canonicalUrl === 'https://www.tiktok.com/@video/video/7234567890123456789', 'TikTok URL A canonicalUrl matches exact ID');
  assert(Boolean(resTtA.data?.formats[0]?.downloadUrl?.includes('7234567890123456789')), 'TikTok URL A format downloadUrl points to 7234567890123456789');

  const resTtB = await extractorRegistry.extract(ttUrlB);
  assert(resTtB.success === true, 'TikTok URL B extracts successfully');
  assert(resTtB.data?.mediaId === '7345678901234567890', 'TikTok URL B returns exact mediaId 7345678901234567890');

  const resTtC = await extractorRegistry.extract(ttUrlC);
  assert(resTtC.success === true, 'TikTok URL C extracts successfully');
  assert(resTtC.data?.mediaId === '7456789012345678901', 'TikTok URL C returns exact mediaId 7456789012345678901');

  // Verify Non-cross contamination
  assert(resTtA.data?.mediaId !== resTtB.data?.mediaId, 'TikTok A never returns B');
  assert(resTtB.data?.mediaId !== resTtC.data?.mediaId, 'TikTok B never returns C');
  assert(resTtA.data?.mediaId !== resTtC.data?.mediaId, 'TikTok A never returns C');

  // Verify Cache Isolation for TikTok
  const resTtACached = await extractorRegistry.extract(ttUrlA);
  assert(resTtACached.data?.mediaId === '7234567890123456789', 'TikTok URL A cached result returns exact video A');
  const resTtBCached = await extractorRegistry.extract(ttUrlB);
  assert(resTtBCached.data?.mediaId === '7345678901234567890', 'TikTok URL B cached result returns exact video B');

  // ==========================================
  // 3. YOUTUBE INTACT VERIFICATION TESTS
  // ==========================================
  console.log('\n--- 3. Testing YouTube (Ensuring Intact Functionality) ---');
  const ytUrlA = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const ytUrlB = 'https://youtu.be/jNQXAC9IVRw?si=tracking_123';

  const resYtA = await extractorRegistry.extract(ytUrlA);
  assert(resYtA.success === true, 'YouTube URL A extracts successfully');
  assert(resYtA.data?.mediaId === 'dQw4w9WgXcQ', 'YouTube URL A returns exact mediaId dQw4w9WgXcQ');
  assert(Boolean(resYtA.data?.formats[0]?.downloadUrl?.includes('dQw4w9WgXcQ')), 'YouTube URL A formats point to dQw4w9WgXcQ');

  const resYtB = await extractorRegistry.extract(ytUrlB);
  assert(resYtB.success === true, 'YouTube URL B extracts successfully');
  assert(resYtB.data?.mediaId === 'jNQXAC9IVRw', 'YouTube URL B returns exact mediaId jNQXAC9IVRw');

  // ==========================================
  // 4. INVALID URL & SAFE FAILURE TESTS
  // ==========================================
  console.log('\n--- 4. Testing Safe Failure (No Fallbacks / No Fake Videos) ---');
  const invalidUrl = 'https://www.instagram.com/invalid/url/here/';
  const resInvalid = await extractorRegistry.extract(invalidUrl);
  assert(resInvalid.success === false, 'Invalid Instagram URL fails safely');
  assert(resInvalid.error === EXACT_MEDIA_ERROR_MESSAGE, 'Invalid URL returns EXACT_MEDIA_ERROR_MESSAGE');
  assert(resInvalid.data === undefined, 'Invalid URL never returns any fallback data');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
  console.log('====================================================');
}

runExtractorTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

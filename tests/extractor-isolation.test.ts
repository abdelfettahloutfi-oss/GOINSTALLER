import { extractorRegistry } from '../lib/extractors/registry';
import { normalizeAndIdentifyMedia, cleanTrackingParameters } from '../lib/extractors/normalizer';
import { validateMediaResult } from '../lib/extractors/validator';
import { mediaCache } from '../lib/extractors/cache';
import { EXACT_MEDIA_ERROR_MESSAGE } from '../lib/extractors/types';
import { tokenService } from '../services/download/token-service';

async function runTests() {
  console.log('--- STARTING GOINSTALLER EXACT MEDIA VERIFICATION TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, failureDetail?: string) {
    if (condition) {
      console.log(`  PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  FAIL: ${testName}`);
      if (failureDetail) console.error(`    Detail: ${failureDetail}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Tracking Parameter Removal while preserving content IDs
  // -------------------------------------------------------------
  console.log('1. Testing URL Normalization & Tracking Parameter Stripping:');
  const dirtyYoutube = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=newsletter&si=abc123xyz&fbclid=IwAR0';
  const cleanYt = normalizeAndIdentifyMedia(dirtyYoutube);
  assert(
    cleanYt.mediaId === 'dQw4w9WgXcQ',
    'YouTube tracking stripping preserves exact video ID',
    `Expected dQw4w9WgXcQ, got ${cleanYt.mediaId}`
  );
  assert(
    cleanYt.canonicalUrl === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'YouTube canonical URL is clean',
    cleanYt.canonicalUrl
  );

  const dirtyFacebook = 'https://www.facebook.com/watch/?v=10158784378129871&ref=bookmarks&mibextid=ZbWKwL';
  const cleanFb = normalizeAndIdentifyMedia(dirtyFacebook);
  assert(
    cleanFb.mediaId === '10158784378129871',
    'Facebook tracking stripping preserves video ID',
    `Expected 10158784378129871, got ${cleanFb.mediaId}`
  );

  const dirtyInstagram = 'https://www.instagram.com/reel/C3x9zP1LXyq/?igsh=MWQ1ZGUxMzBkMA==&utm_medium=share_sheet';
  const cleanIg = normalizeAndIdentifyMedia(dirtyInstagram);
  assert(
    cleanIg.mediaId === 'C3x9zP1LXyq',
    'Instagram tracking stripping preserves shortcode',
    `Expected C3x9zP1LXyq, got ${cleanIg.mediaId}`
  );

  const dirtyTwitter = 'https://x.com/SpaceX/status/1789456123456789012?s=20&t=abcdef12345';
  const cleanTw = normalizeAndIdentifyMedia(dirtyTwitter);
  assert(
    cleanTw.mediaId === '1789456123456789012',
    'Twitter/X tracking stripping preserves tweet ID',
    `Expected 1789456123456789012, got ${cleanTw.mediaId}`
  );

  // -------------------------------------------------------------
  // Test 2: URL A always returns media for URL A; URL B always returns for URL B; URL A never returns for URL B
  // -------------------------------------------------------------
  console.log('\n2. Testing Cross-URL Isolation (A vs B):');
  const urlA = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const urlB = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

  const resA = await extractorRegistry.extract(urlA);
  const resB = await extractorRegistry.extract(urlB);

  assert(resA.success === true, 'URL A extracts successfully');
  assert(resB.success === true, 'URL B extracts successfully');

  if (resA.success && resA.data && resB.success && resB.data) {
    assert(
      resA.data.mediaId === 'dQw4w9WgXcQ',
      'URL A returned exact mediaId for URL A',
      `Got ${resA.data.mediaId}`
    );
    assert(
      resB.data.mediaId === 'jNQXAC9IVRw',
      'URL B returned exact mediaId for URL B',
      `Got ${resB.data.mediaId}`
    );
    assert(
      resA.data.mediaId !== resB.data.mediaId,
      'URL A NEVER returns media for URL B (IDs are strictly distinct)',
      `Both returned ${resA.data.mediaId}`
    );
    assert(
      resA.data.canonicalUrl !== resB.data.canonicalUrl,
      'Canonical URLs are strictly distinct between A and B'
    );
    // Format download token check
    assert(
      resA.data.formats.every((f) => {
        if (f.token) {
          const p = tokenService.decodePayloadWithoutVerification(f.token);
          return p?.mediaId === 'dQw4w9WgXcQ';
        }
        return f.downloadUrl.includes('dQw4w9WgXcQ');
      }),
      'All URL A format downloads belong strictly to URL A ID'
    );
    assert(
      resB.data.formats.every((f) => {
        if (f.token) {
          const p = tokenService.decodePayloadWithoutVerification(f.token);
          return p?.mediaId === 'jNQXAC9IVRw';
        }
        return f.downloadUrl.includes('jNQXAC9IVRw');
      }),
      'All URL B format downloads belong strictly to URL B ID'
    );
  }

  // -------------------------------------------------------------
  // Test 3: Vimeo A vs Vimeo B isolation
  // -------------------------------------------------------------
  console.log('\n3. Testing Vimeo Video Isolation:');
  const vimeoA = 'https://vimeo.com/76979871';
  const vimeoB = 'https://vimeo.com/1084537';

  const resVimeoA = await extractorRegistry.extract(vimeoA);
  const resVimeoB = await extractorRegistry.extract(vimeoB);

  if (resVimeoA.success && resVimeoA.data && resVimeoB.success && resVimeoB.data) {
    assert(resVimeoA.data.mediaId === '76979871', 'Vimeo A returned exact ID 76979871');
    assert(resVimeoB.data.mediaId === '1084537', 'Vimeo B returned exact ID 1084537');
    assert(
      resVimeoA.data.mediaId !== resVimeoB.data.mediaId,
      'Vimeo A never returns media for Vimeo B'
    );
  } else {
    assert(
      resVimeoA.error === EXACT_MEDIA_ERROR_MESSAGE || resVimeoA.success,
      'Vimeo A either extracts or safely fails without fallback'
    );
    assert(
      resVimeoB.error === EXACT_MEDIA_ERROR_MESSAGE || resVimeoB.success,
      'Vimeo B either extracts or safely fails without fallback'
    );
  }

  // -------------------------------------------------------------
  // Test 4: Facebook A vs Facebook B isolation
  // -------------------------------------------------------------
  console.log('\n4. Testing Facebook Isolation:');
  const fbA = 'https://www.facebook.com/watch/?v=10158784378129871';
  const fbB = 'https://www.facebook.com/watch/?v=20249876543210987';

  const resFbA = await extractorRegistry.extract(fbA);
  const resFbB = await extractorRegistry.extract(fbB);

  assert(resFbA.success === true, 'Facebook A extracts successfully');
  assert(resFbB.success === true, 'Facebook B extracts successfully');

  if (resFbA.success && resFbA.data && resFbB.success && resFbB.data) {
    assert(resFbA.data.mediaId === '10158784378129871', 'Facebook A returned exact ID 10158784378129871');
    assert(resFbB.data.mediaId === '20249876543210987', 'Facebook B returned exact ID 20249876543210987');
    assert(resFbA.data.mediaId !== resFbB.data.mediaId, 'Facebook A never returns media for Facebook B');
  }

  // -------------------------------------------------------------
  // Test 5: Cache Isolation
  // -------------------------------------------------------------
  console.log('\n5. Testing Cache Integrity:');
  mediaCache.clear();
  // Request URL A -> stored in cache
  await extractorRegistry.extract(urlA);
  // Fetch from cache for URL B -> must be null
  const cacheCheckB = mediaCache.get('youtube', 'jNQXAC9IVRw');
  assert(cacheCheckB === null, 'Cache for URL B is empty when only URL A was cached');

  const cacheCheckA = mediaCache.get('youtube', 'dQw4w9WgXcQ');
  assert(cacheCheckA !== null && cacheCheckA.mediaId === 'dQw4w9WgXcQ', 'Cache for URL A returns exact media for URL A');

  // -------------------------------------------------------------
  // Test 6: Never Silently Replace Failed Extraction with Other Video
  // -------------------------------------------------------------
  console.log('\n6. Testing Error Handling on Invalid/Mismatched URLs:');
  const invalidUrl = 'https://www.youtube.com/watch?v=invalid_id';
  const resInvalid = await extractorRegistry.extract(invalidUrl);
  assert(
    resInvalid.success === false,
    'Invalid video URL fails extraction',
    `Expected failure, got success: ${resInvalid.success}`
  );
  assert(
    resInvalid.error === EXACT_MEDIA_ERROR_MESSAGE,
    'Returns exact error message: "We couldn\'t retrieve this exact video. Please check the URL and try again."',
    `Got error: ${resInvalid.error}`
  );

  const nonMediaUrl = 'https://example.com/blog/article-about-cooking';
  const resNonMedia = await extractorRegistry.extract(nonMediaUrl);
  assert(
    resNonMedia.success === false,
    'Arbitrary non-media web link is rejected and never returns fallback video',
    `Success was: ${resNonMedia.success}`
  );
  assert(
    resNonMedia.error === EXACT_MEDIA_ERROR_MESSAGE,
    'Non-media URL returns standard exact error message'
  );

  // -------------------------------------------------------------
  // Test 7: Post-Extraction Validation Function
  // -------------------------------------------------------------
  console.log('\n7. Testing Strict Post-Extraction Validator:');
  const validCheck = validateMediaResult(urlA, resA.data);
  assert(validCheck.valid === true, 'Legitimate media passes validation check');

  // Deliberately swapped metadata to simulate a rogue/fallback extractor
  const hijackedMetadata = { ...resA.data!, mediaId: 'WRONG_ID_HIJACKED', id: 'yt_WRONG_ID_HIJACKED' };
  const hijackedCheck = validateMediaResult(urlA, hijackedMetadata);
  assert(
    hijackedCheck.valid === false,
    'Swapped / fallback video fails validation immediately',
    `Reason: ${hijackedCheck.reason}`
  );

  // -------------------------------------------------------------
  // Test 8: Instagram URL Isolation and Case-Sensitive Cache Tests
  // -------------------------------------------------------------
  console.log('\n8. Testing Instagram URL Isolation & Case-Sensitive Cache:');
  const igCodeA = 'C3x9zP1LXyq';
  const igCodeB = 'DB8K012ABCD';
  const igUrlA = `https://www.instagram.com/reel/${igCodeA}/`;
  const igUrlB = `https://www.instagram.com/reel/${igCodeB}/`;

  const normIgA = normalizeAndIdentifyMedia(igUrlA);
  const normIgB = normalizeAndIdentifyMedia(igUrlB);
  assert(normIgA.mediaId === igCodeA, 'Instagram A normalizes to shortcode A');
  assert(normIgB.mediaId === igCodeB, 'Instagram B normalizes to shortcode B');
  assert(normIgA.mediaId !== normIgB.mediaId, 'Instagram shortcodes are strictly distinct');

  // Test case-sensitive cache isolation
  mediaCache.clear();
  const dummyMetaA: any = { id: 'ig_aBcDeF', mediaId: 'aBcDeF', title: 'Video A', formats: [] };
  const dummyMetaB: any = { id: 'ig_AbCdEf', mediaId: 'AbCdEf', title: 'Video B', formats: [] };
  mediaCache.set('instagram', 'aBcDeF', 'https://www.instagram.com/p/aBcDeF/', dummyMetaA);
  mediaCache.set('instagram', 'AbCdEf', 'https://www.instagram.com/p/AbCdEf/', dummyMetaB);

  const cachedA = mediaCache.get('instagram', 'aBcDeF');
  const cachedB = mediaCache.get('instagram', 'AbCdEf');
  assert(cachedA?.mediaId === 'aBcDeF', 'Cache returns distinct entry for case-sensitive shortcode A');
  assert(cachedB?.mediaId === 'AbCdEf', 'Cache returns distinct entry for case-sensitive shortcode B');
  assert(cachedA?.mediaId !== cachedB?.mediaId, 'Case-sensitive shortcodes never collide in cache');

  // Test Instagram extraction failure safety
  const resIgA = await extractorRegistry.extract(igUrlA);
  if (!resIgA.success) {
    assert(
      resIgA.error?.includes("We couldn't retrieve this exact Instagram video") ||
      resIgA.error === EXACT_MEDIA_ERROR_MESSAGE,
      'Instagram extraction fails safely when upstream streams are restricted',
      `Error: ${resIgA.error}`
    );
  }

  console.log(`\n--- TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test runner exception:', e);
  process.exit(1);
});

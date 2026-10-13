import { extractorRegistry } from '../services/platforms/registry';
import { tokenService } from '../services/download/token-service';
import { downloadService } from '../services/download/download-service';
import { mediaCache } from '../services/cache/media-cache';
import { EXACT_MEDIA_ERROR_MESSAGE } from '../services/platforms/types';
import { validateMediaResult } from '../services/platforms/validator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  FAIL: ${testName}`);
    if (details) console.error(`    -> Details: ${details}`);
    failed++;
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('   GOINSTALLER MULTI-PLATFORM MEDIA & TOKEN AUDIT TEST SUITE   ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: YouTube Exact Media Isolation & Token Verification
  // -------------------------------------------------------------
  console.log('1. YouTube Video Isolation & Authentic Token Check:');
  const ytA = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const ytB = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

  const resYtA = await extractorRegistry.extract(ytA);
  const resYtB = await extractorRegistry.extract(ytB);

  assert(resYtA.success === true, 'YouTube A extracts successfully');
  assert(resYtB.success === true, 'YouTube B extracts successfully');

  if (resYtA.success && resYtA.data && resYtB.success && resYtB.data) {
    assert(resYtA.data.mediaId === 'dQw4w9WgXcQ', 'YouTube A returns exact media ID dQw4w9WgXcQ');
    assert(resYtB.data.mediaId === 'jNQXAC9IVRw', 'YouTube B returns exact media ID jNQXAC9IVRw');
    assert(resYtA.data.mediaId !== resYtB.data.mediaId, 'Media IDs are strictly distinct');
    assert(resYtA.data.title !== resYtB.data.title, 'Video titles are authentic and distinct');
    assert(resYtA.data.thumbnail.includes('dQw4w9WgXcQ'), 'Thumbnail A strictly matches ID A');
    assert(resYtB.data.thumbnail.includes('jNQXAC9IVRw'), 'Thumbnail B strictly matches ID B');

    // Token binding check
    const formatA = resYtA.data.formats[0];
    const formatB = resYtB.data.formats[0];
    const payloadA = tokenService.decodePayloadWithoutVerification(formatA.token!);
    const payloadB = tokenService.decodePayloadWithoutVerification(formatB.token!);

    assert(payloadA?.mediaId === 'dQw4w9WgXcQ', 'Format token A bound strictly to mediaId A');
    assert(payloadB?.mediaId === 'jNQXAC9IVRw', 'Format token B bound strictly to mediaId B');
    assert(payloadA?.mediaId !== payloadB?.mediaId, 'Tokens never share media ID');
  }

  // -------------------------------------------------------------
  // Test 2: Cache Isolation (A -> B -> A)
  // -------------------------------------------------------------
  console.log('\n2. Cache Isolation (A -> B -> A):');
  mediaCache.clear();
  
  // First request: A
  const res1A = await extractorRegistry.extract(ytA);
  assert(res1A.success && res1A.data?.mediaId === 'dQw4w9WgXcQ', 'Step 1: Request A returns mediaId A');

  // Second request: B
  const res2B = await extractorRegistry.extract(ytB);
  assert(res2B.success && res2B.data?.mediaId === 'jNQXAC9IVRw', 'Step 2: Request B returns mediaId B');

  // Third request: A again
  const res3A = await extractorRegistry.extract(ytA);
  assert(res3A.success && res3A.data?.mediaId === 'dQw4w9WgXcQ', 'Step 3: Request A returns mediaId A again');
  assert(res3A.data?.mediaId !== res2B.data?.mediaId, 'Request A in step 3 did not leak result B');

  // -------------------------------------------------------------
  // Test 3: Generic Direct MP4 Extraction & Streaming
  // -------------------------------------------------------------
  console.log('\n3. Direct MP4 Extraction & Download Service Stream:');
  const directMp4Url = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  const resDirect = await extractorRegistry.extract(directMp4Url);

  assert(resDirect.success === true, 'Direct MP4 extracts successfully');
  if (resDirect.success && resDirect.data) {
    assert(resDirect.data.mediaId === 'flower.mp4', 'Direct MP4 mediaId is flower.mp4');
    const token = resDirect.data.formats[0]?.token;
    assert(Boolean(token), 'Direct MP4 format has signed token');

    const verifyToken = tokenService.verifyToken(token!);
    assert(verifyToken.valid === true, 'Signed token verifies correctly');
    assert(verifyToken.payload?.directMediaUrl === directMp4Url, 'Direct stream URL in token matches input');

    // Test download service streaming
    const dummyReq = new Request('http://localhost:3000/api/v1/download?token=' + token);
    const streamRes = await downloadService.streamMediaResponse(dummyReq, verifyToken.payload!);
    assert(streamRes.status === 200, 'Download service responds with HTTP 200 for direct media');
    assert(
      streamRes.headers.get('Content-Disposition')?.includes('flower') === true,
      'Content-Disposition attachment filename matches exact media'
    );
  }

  // -------------------------------------------------------------
  // Test 4: Vimeo Exact Media or Fail-Safe
  // -------------------------------------------------------------
  console.log('\n4. Vimeo Video Extraction & Format Stream:');
  const vimeoUrl = 'https://vimeo.com/76979871';
  const resVimeo = await extractorRegistry.extract(vimeoUrl);
  if (resVimeo.success && resVimeo.data) {
    assert(resVimeo.data.mediaId === '76979871', 'Vimeo returns exact media ID 76979871');
    assert(resVimeo.data.formats.length > 0, 'Vimeo returns authenticated stream formats');
    const vimeoToken = resVimeo.data.formats[0].token;
    const vimeoPayload = tokenService.decodePayloadWithoutVerification(vimeoToken!);
    assert(vimeoPayload?.mediaId === '76979871', 'Vimeo token mediaId matches exactly');
  } else {
    assert(
      resVimeo.error?.includes("We couldn't retrieve this exact") || resVimeo.error === EXACT_MEDIA_ERROR_MESSAGE,
      'Vimeo fails safely with explicit error when restricted'
    );
  }

  // -------------------------------------------------------------
  // Test 5: Instagram Safe Fail on Upstream Restriction
  // -------------------------------------------------------------
  console.log('\n5. Instagram Restriction Safety Check:');
  const igUrl = 'https://www.instagram.com/reel/C3x9zP1LXyq/';
  const resIg = await extractorRegistry.extract(igUrl);
  if (resIg.success) {
    assert(resIg.data?.mediaId === 'C3x9zP1LXyq', 'Instagram returned exact media ID C3x9zP1LXyq');
  } else {
    assert(
      resIg.error?.includes("We couldn't retrieve this exact Instagram video") || resIg.error === EXACT_MEDIA_ERROR_MESSAGE,
      'Instagram fails safely with explicit error without returning fake video'
    );
  }

  // -------------------------------------------------------------
  // Test 6: TikTok Safe Fail / Extraction Check
  // -------------------------------------------------------------
  console.log('\n6. TikTok Extraction / Safety Check:');
  const ttUrl = 'https://www.tiktok.com/@creator/video/7234567890123456789';
  const resTt = await extractorRegistry.extract(ttUrl);
  if (resTt.success) {
    assert(resTt.data?.mediaId === '7234567890123456789', 'TikTok returned exact media ID');
  } else {
    assert(
      resTt.error?.includes("We couldn't retrieve this exact") || resTt.error === EXACT_MEDIA_ERROR_MESSAGE,
      'TikTok fails safely with explicit error without returning fake video'
    );
  }

  // -------------------------------------------------------------
  // Test 7: Facebook Safe Fail on Upstream Restriction
  // -------------------------------------------------------------
  console.log('\n7. Facebook Restriction Safety Check:');
  const fbUrl = 'https://www.facebook.com/watch/?v=10158784378129871';
  const resFb = await extractorRegistry.extract(fbUrl);
  if (resFb.success) {
    assert(resFb.data?.mediaId === '10158784378129871', 'Facebook returned exact media ID');
  } else {
    assert(
      resFb.error?.includes("We couldn't retrieve this exact Facebook video") || resFb.error === EXACT_MEDIA_ERROR_MESSAGE,
      'Facebook fails safely with explicit error without returning fake video'
    );
  }

  // -------------------------------------------------------------
  // Test 8: Twitter/X Safe Fail on Upstream Restriction
  // -------------------------------------------------------------
  console.log('\n8. Twitter/X Restriction Safety Check:');
  const twUrl = 'https://x.com/SpaceX/status/1789456123456789012';
  const resTw = await extractorRegistry.extract(twUrl);
  if (resTw.success) {
    assert(resTw.data?.mediaId === '1789456123456789012', 'Twitter returned exact media ID');
  } else {
    assert(
      resTw.error?.includes("We couldn't retrieve this exact X (Twitter) video") || resTw.error === EXACT_MEDIA_ERROR_MESSAGE,
      'Twitter fails safely with explicit error without returning fake video'
    );
  }

  // -------------------------------------------------------------
  // Test 9: Threads Safe Fail on Upstream Restriction
  // -------------------------------------------------------------
  console.log('\n9. Threads Restriction Safety Check:');
  const thUrl = 'https://www.threads.net/@creator/post/C3x9zP1LXyq';
  const resTh = await extractorRegistry.extract(thUrl);
  if (resTh.success) {
    assert(resTh.data?.mediaId === 'C3x9zP1LXyq', 'Threads returned exact media ID');
  } else {
    assert(
      resTh.error?.includes("We couldn't retrieve this exact Threads video") || resTh.error === EXACT_MEDIA_ERROR_MESSAGE,
      'Threads fails safely with explicit error without returning fake video'
    );
  }

  // -------------------------------------------------------------
  // Test 10: Token Tampering & Hijack Prevention
  // -------------------------------------------------------------
  console.log('\n10. Token Security & Mismatch Rejection:');
  const genuineToken = tokenService.generateToken({
    mediaId: 'dQw4w9WgXcQ',
    platform: 'youtube',
    formatId: 'yt_dQw4w9WgXcQ_1080p',
    ext: 'mp4',
    quality: '1080p Full HD',
    mimeType: 'video/mp4',
  });

  const validCheck = tokenService.verifyToken(genuineToken);
  assert(validCheck.valid === true, 'Authentic unaltered token passes verification');

  // Tampered payload
  const parts = genuineToken.split('.');
  const tamperedPayload = Buffer.from(
    JSON.stringify({
      mediaId: 'HIJACKED_ID_123',
      platform: 'youtube',
      formatId: 'yt_HIJACKED_ID_123_1080p',
      ext: 'mp4',
      quality: '1080p',
      expiresAt: Date.now() + 3600000,
    })
  ).toString('base64url');
  const tamperedToken = `${tamperedPayload}.${parts[1]}`;

  const tamperedCheck = tokenService.verifyToken(tamperedToken);
  assert(tamperedCheck.valid === false, 'Tampered token signature is rejected immediately');

  // Expired token
  const expiredToken = tokenService.generateToken(
    {
      mediaId: 'dQw4w9WgXcQ',
      platform: 'youtube',
      formatId: 'yt_dQw4w9WgXcQ_1080p',
      ext: 'mp4',
      quality: '1080p Full HD',
      mimeType: 'video/mp4',
    },
    -10
  );
  const expiredCheck = tokenService.verifyToken(expiredToken);
  assert(expiredCheck.valid === false, 'Expired token is rejected');

  // -------------------------------------------------------------
  // Test 11: Non-Media Web Link Rejection
  // -------------------------------------------------------------
  console.log('\n11. Non-Media Web Link Rejection:');
  const nonMediaUrl = 'https://example.com/blog/article-about-cooking';
  const resNonMedia = await extractorRegistry.extract(nonMediaUrl);
  assert(resNonMedia.success === false, 'Non-media URL rejected');
  assert(
    resNonMedia.error?.includes('Unsupported platform') || resNonMedia.error === EXACT_MEDIA_ERROR_MESSAGE,
    'Non-media URL returns standard error message'
  );

  console.log(`\n================================================================`);
  console.log(`   AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED           `);
  console.log(`================================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(console.error);

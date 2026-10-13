import { extractorRegistry } from '../services/platforms/registry';
import { mediaCache } from '../services/cache/media-cache';
import { tokenService } from '../services/download/token-service';

async function testInstagramFlow() {
  const urlA = 'https://www.instagram.com/reel/C3x9zP1LXyq/';
  const urlB = 'https://www.instagram.com/reel/C_testDifferentCode99/';

  console.log('--- Testing URL A ---');
  const resA = await extractorRegistry.extract(urlA);
  console.log('Result A:', {
    success: resA.success,
    mediaId: resA.data?.mediaId,
    canonicalUrl: resA.data?.canonicalUrl,
    title: resA.data?.title,
    thumbnail: resA.data?.thumbnail,
    formatsCount: resA.data?.formats.length,
    format0_id: resA.data?.formats[0]?.id,
    format0_token: resA.data?.formats[0]?.token,
    format0_directStreamUrl: resA.data?.formats[0]?.directStreamUrl,
  });

  if (resA.data?.formats[0]?.token) {
    const payloadA = tokenService.decodePayloadWithoutVerification(resA.data.formats[0].token);
    console.log('Token Payload A:', payloadA);
  }

  console.log('\n--- Testing URL B ---');
  const resB = await extractorRegistry.extract(urlB);
  console.log('Result B:', {
    success: resB.success,
    mediaId: resB.data?.mediaId,
    canonicalUrl: resB.data?.canonicalUrl,
    title: resB.data?.title,
    thumbnail: resB.data?.thumbnail,
    formatsCount: resB.data?.formats.length,
    format0_id: resB.data?.formats[0]?.id,
    format0_token: resB.data?.formats[0]?.token,
    format0_directStreamUrl: resB.data?.formats[0]?.directStreamUrl,
  });

  if (resB.data?.formats[0]?.token) {
    const payloadB = tokenService.decodePayloadWithoutVerification(resB.data.formats[0].token);
    console.log('Token Payload B:', payloadB);
  }
}

testInstagramFlow().catch(console.error);

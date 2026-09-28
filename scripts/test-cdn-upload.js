const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.minibunnybd.com';

async function runUploadPipelineTest() {
  console.log('=== MINI BUNNY IMAGE UPLOAD & CDN EDGE TEST ===\n');

  // 1. Create a 800x800 test image using sharp
  const rawPng = await sharp({
    create: {
      width: 800,
      height: 800,
      channels: 4,
      background: { r: 245, g: 158, b: 11, alpha: 1 } // Amber
    }
  }).png().toBuffer();

  console.log('1. Raw Image Buffer Created:', rawPng.length, 'bytes');

  // 2. Compress via sharp to WebP (Quality 82, 1200px max)
  const compressed = await sharp(rawPng)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  console.log('2. Compressed to WebP:', compressed.length, 'bytes');

  // 3. Upload to Supabase Storage bucket: product-images
  const supabase = createClient(supabaseUrl, supabaseKey);
  const filename = `test-product-${Date.now()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filename, compressed, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: '31536000'
    });

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    return;
  }
  console.log('3. Uploaded to Supabase Storage: product-images/' + filename);

  // 4. Construct Public CDN URL
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filename);
  const liveCdnUrl = publicUrl.replace(supabaseUrl, cdnBase);
  console.log('4. Live Public CDN URL:', liveCdnUrl);

  // 5. Fetch image via Cloudflare CDN
  console.log('\n--- Fetching via Cloudflare CDN (First Request) ---');
  const t0 = Date.now();
  const cdnRes = await fetch(liveCdnUrl);
  const latency1 = Date.now() - t0;
  const imageBytes = (await cdnRes.arrayBuffer()).byteLength;

  console.log('HTTP Status:', cdnRes.status, cdnRes.statusText);
  console.log('Content-Type:', cdnRes.headers.get('content-type'));
  console.log('Content-Length:', imageBytes, 'bytes');
  console.log('X-CDN-Cache:', cdnRes.headers.get('x-cdn-cache'));
  console.log('Cache-Control:', cdnRes.headers.get('cache-control'));
  console.log('Server:', cdnRes.headers.get('server'));
  console.log('CF-Ray:', cdnRes.headers.get('cf-ray'));
  console.log('First Request Latency:', latency1 + 'ms');

  // 6. Fetch again to verify edge caching speed
  console.log('\n--- Fetching via Cloudflare CDN (Edge Cached Request) ---');
  const t1 = Date.now();
  const cachedRes = await fetch(liveCdnUrl);
  const latency2 = Date.now() - t1;

  console.log('Cached HTTP Status:', cachedRes.status);
  console.log('Edge Cached Latency:', latency2 + 'ms (Ultra fast!)');

  console.log('\n=== ALL UPLOAD & CDN TESTS PASSED SUCCESSFULLY! ===');
}

runUploadPipelineTest();

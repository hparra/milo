import { createTag } from '../../utils/utils.js';
import { createVideoObject } from '../video-metadata/video-metadata.js';

// TODO: Determine the best way to feature flag in Milo
const ENABLE_VIDEO_SEO = true;

// TODO: This should be some convention at site root, e.g. /video-metadata.json
// https://adobe.sharepoint.com/:x:/r/sites/adobecom/Shared%20Documents/milo/drafts/hgpa/test/video-autoblocks/videos.xlsx?d=w30755cc09d43402898a1d31fd82adc0f&csf=1&web=1&e=3kLnTP
const VIDEO_XLSX = '/drafts/hgpa/test/video-autoblocks/videos.json';

async function findVideoByUrl(url) {
  const resp = await fetch(VIDEO_XLSX);
  if (!resp.ok) {
    window.lana.log(`adobetv -- ${url} not found`);
    return [];
  }
  const videos = await resp.json().then((j) => j.data);
  // TODO: This REQUIRES spreadsheet to have case-sensitive schema
  return videos.find((row) => row['Content URL'] === url || row['Embed URL'] === url);
}

async function appendJsonLd(a) {
  if (!ENABLE_VIDEO_SEO) return;
  const video = await findVideoByUrl(a.href);
  if (!video) return; // TODO: log error?
  console.log(video); // TODO: remove
  const jsonld = createVideoObject(video);
  console.log(jsonld); // TODO: remove
  const script = createTag('script', { type: 'application/ld+json' }, JSON.stringify(jsonld));
  document.head.append(script);
}

function appendEmbed(a) {
  const embed = `<div class="milo-video">
    <iframe src="${a.href}" class="adobetv" webkitallowfullscreen mozallowfullscreen allowfullscreen scrolling="no" allow="encrypted-media" title="Adobe Video Publishing Cloud Player" loading="lazy">
    </iframe>
  </div>`;
  a.insertAdjacentHTML('afterend', embed);
}

export default async function init(a) {
  await Promise.all([
    appendJsonLd(a),
    appendEmbed(a),
  ]);
  a.remove();
}

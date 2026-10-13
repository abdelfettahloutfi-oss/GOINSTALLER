import { MediaPlatform } from '@/lib/extractors/types';

export interface PseoPageData {
  slug: string;
  platform: MediaPlatform;
  platformName: string;
  badge: string;
  title: string;
  h1: string;
  tagline: string;
  metaDescription: string;
  primaryFormat: 'MP4' | 'MP3' | 'ALL';
  keywords: string[];
  features: Array<{ title: string; desc: string; icon: string }>;
  steps: Array<{ step: number; title: string; desc: string }>;
  faqs: Array<{ question: string; answer: string }>;
  sampleUrl: string;
}

export const PSEO_PAGES: Record<string, PseoPageData> = {
  'youtube-video-downloader': {
    slug: 'youtube-video-downloader',
    platform: 'youtube',
    platformName: 'YouTube',
    badge: '4K & 1080p Support',
    title: 'YouTube Video Downloader – Download YouTube Videos in HD & 4K',
    h1: 'YouTube Video Downloader',
    tagline: 'Download YouTube videos in 1080p Full HD, 2K, 4K, and extract MP3 audio files instantly without software.',
    metaDescription: 'Free online YouTube video downloader. Download videos from YouTube in MP4, 1080p, 720p, or convert to MP3 320kbps. Fast, mobile-ready, and 100% free.',
    primaryFormat: 'MP4',
    keywords: ['youtube video downloader', 'download youtube video', 'youtube to mp4', 'youtube hd download', 'youtube 1080p'],
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    features: [
      { title: 'Full 1080p & 4K Quality', desc: 'Preserve cinema-grade resolution with crystal clear visual reproduction.', icon: 'Video' },
      { title: 'High-Speed Conversion', desc: 'Cloud stream extraction processes lengthy videos in just seconds.', icon: 'Zap' },
      { title: 'Zero Software Needed', desc: 'Works directly in Chrome, Safari, Firefox, and Edge on iOS, Android, and PC.', icon: 'Globe' },
      { title: 'Audio Separation', desc: 'Easily isolate audio tracks into high bitrate 320kbps MP3 files.', icon: 'Music' },
    ],
    steps: [
      { step: 1, title: 'Copy YouTube URL', desc: 'Navigate to YouTube, tap share, and copy the link to the video or Shorts.' },
      { step: 2, title: 'Paste into Goinstaller', desc: 'Paste the copied URL into the search box above and hit Download.' },
      { step: 3, title: 'Select Quality & Save', desc: 'Choose your desired resolution (1080p, 720p, or MP3) and download directly.' },
    ],
    faqs: [
      { question: 'Is Goinstaller YouTube downloader free?', answer: 'Yes! Goinstaller is 100% free with unlimited downloads and no registration required.' },
      { question: 'What video resolutions are supported?', answer: 'We support standard 360p, 480p, 720p HD, 1080p Full HD, and where available, 1440p 2K and 2160p 4K.' },
      { question: 'Can I download YouTube Shorts?', answer: 'Yes, simply copy the URL from any YouTube Shorts video and paste it in the search bar.' },
    ],
  },
  'youtube-to-mp3': {
    slug: 'youtube-to-mp3',
    platform: 'youtube',
    platformName: 'YouTube',
    badge: '320kbps Ultra Audio',
    title: 'YouTube to MP3 Converter – Download 320kbps MP3 High Quality',
    h1: 'YouTube to MP3 Converter',
    tagline: 'Convert YouTube videos to high-bitrate MP3 audio (320kbps, 256kbps, 192kbps) in seconds.',
    metaDescription: 'Convert and download YouTube videos to MP3 high quality 320kbps audio. Free online YouTube MP3 extractor for mobile, desktop, and tablets.',
    primaryFormat: 'MP3',
    keywords: ['youtube to mp3', 'convert youtube to mp3', 'youtube audio downloader', 'youtube 320kbps', 'youtube sound ripper'],
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    features: [
      { title: 'Studio 320kbps Bitrate', desc: 'Experience uncompressed sound fidelity for music, podcasts, and soundscapes.', icon: 'Headphones' },
      { title: 'Batch Format Selection', desc: 'Choose between MP3, M4A, and AAC depending on your audio player preference.', icon: 'Sliders' },
      { title: 'ID3 Tag Retained', desc: 'Downloads include track title, artist name, and album artwork automatically.', icon: 'FileText' },
    ],
    steps: [
      { step: 1, title: 'Copy Music Link', desc: 'Copy the URL of any song, podcast, or sound video from YouTube.' },
      { step: 2, title: 'Paste & Detect', desc: 'Paste the link in the input above. Goinstaller will automatically isolate audio streams.' },
      { step: 3, title: 'Save 320kbps MP3', desc: 'Click Download next to MP3 320kbps to immediately download the audio track.' },
    ],
    faqs: [
      { question: 'What is the highest audio quality provided?', answer: 'We provide up to 320kbps CBR/VBR MP3, matching CD-quality digital listening standards.' },
      { question: 'Does it work on iPhone and iPad?', answer: 'Yes! iOS Safari directly saves the downloaded MP3 into your Files app or Music player.' },
    ],
  },
  'facebook-video-downloader': {
    slug: 'facebook-video-downloader',
    platform: 'facebook',
    platformName: 'Facebook',
    badge: 'FDownloader Alternative',
    title: 'Facebook Video Downloader – Download FB Videos & Reels in Full HD',
    h1: 'Facebook Video Downloader',
    tagline: 'Download Facebook videos, Reels, Watch clips, and public stories in Full HD 1080p, 2K, 4K, or MP3.',
    metaDescription: 'Free online Facebook video downloader. Save Facebook Reels and public Watch videos in 1080p Full HD MP4 and convert to MP3. Works on Android, iPhone, and PC.',
    primaryFormat: 'MP4',
    keywords: ['facebook video downloader', 'fb video download', 'facebook reels downloader', 'fdownloader', 'facebook to mp4'],
    sampleUrl: 'https://www.facebook.com/watch/?v=10158784378129871',
    features: [
      { title: 'HD & Full HD Rendering', desc: 'Download Facebook content in original uploaded crispness without heavy re-compression.', icon: 'Eye' },
      { title: 'Facebook Reels Supported', desc: 'Full support for vertical viral Reels and creator clips.', icon: 'Play' },
      { title: 'Safe & No Login Required', desc: 'Never enter your Facebook password. We strictly process public content ethically.', icon: 'Shield' },
    ],
    steps: [
      { step: 1, title: 'Copy Facebook Link', desc: 'Open Facebook, tap the three dots or share button on the post, and copy link.' },
      { step: 2, title: 'Paste on Goinstaller', desc: 'Paste the URL into the search field and click Download.' },
      { step: 3, title: 'Download MP4', desc: 'Select Full HD 1080p or SD and save the video directly to your storage.' },
    ],
    faqs: [
      { question: 'Where are Facebook videos saved after downloading?', answer: 'They are saved in your device’s default Downloads folder or Gallery.' },
      { question: 'Can I download private Facebook videos?', answer: 'In accordance with privacy standards and ethical terms, we only support downloading public videos.' },
    ],
  },
  'facebook-reels-downloader': {
    slug: 'facebook-reels-downloader',
    platform: 'facebook',
    platformName: 'Facebook',
    badge: 'Vertical Reels HD',
    title: 'Facebook Reels Downloader – Download FB Reels Videos Online',
    h1: 'Facebook Reels Downloader',
    tagline: 'Easily save Facebook Reels in 1080p vertical video format with sound.',
    metaDescription: 'Download Facebook Reels online in HD MP4. Free FB Reel downloader for mobile phones and computers.',
    primaryFormat: 'MP4',
    keywords: ['facebook reels downloader', 'download fb reels', 'fb reel download online', 'facebook short video download'],
    sampleUrl: 'https://www.facebook.com/watch/?v=10158784378129871',
    features: [
      { title: 'Original Sound Synchronized', desc: 'Audio is synchronized in high bitrate without distortion or echo.', icon: 'Volume2' },
      { title: 'One-Click Fast Download', desc: 'Immediate direct stream download without annoying multi-page redirects.', icon: 'Zap' },
    ],
    steps: [
      { step: 1, title: 'Copy Reel Link', desc: 'Tap share on the Reel and choose Copy link.' },
      { step: 2, title: 'Paste & Fetch', desc: 'Paste into Goinstaller to reveal format options.' },
      { step: 3, title: 'Save Reel', desc: 'Click Download to save the vertical MP4 file.' },
    ],
    faqs: [
      { question: 'Can I download Facebook Reels without watermark?', answer: 'Yes, Facebook Reels downloaded through Goinstaller preserve the original media stream.' },
    ],
  },
  'instagram-video-downloader': {
    slug: 'instagram-video-downloader',
    platform: 'instagram',
    platformName: 'Instagram',
    badge: 'Reels & Stories',
    title: 'Instagram Video Downloader – Download IG Reels & Posts in HD',
    h1: 'Instagram Video Downloader',
    tagline: 'Download Instagram Reels, video posts, carousel clips, and public stories in high definition MP4.',
    metaDescription: 'Free Instagram video downloader. Download Instagram Reels, videos, and audio in original high quality. Fast, anonymous, and no Instagram login required.',
    primaryFormat: 'MP4',
    keywords: ['instagram video downloader', 'download instagram reels', 'ig downloader', 'instagram to mp4', 'save ig video'],
    sampleUrl: 'https://www.instagram.com/reel/C3x9zP1LXyq/',
    features: [
      { title: 'Crystal Clear Quality', desc: 'Extracts the original 1080p stream hosted on Meta CDN servers.', icon: 'Sparkles' },
      { title: 'Reels Audio Rip', desc: 'Extract original viral sounds as MP3 audio files with one click.', icon: 'Music2' },
    ],
    steps: [
      { step: 1, title: 'Copy Post Link', desc: 'Open Instagram, tap the paper airplane or three dots, and copy the link.' },
      { step: 2, title: 'Paste into Goinstaller', desc: 'Paste the link above and click Download.' },
      { step: 3, title: 'Save to Gallery', desc: 'Choose 1080p MP4 or Audio MP3 and save to your phone or PC.' },
    ],
    faqs: [
      { question: 'Do I need an Instagram account to use Goinstaller?', answer: 'No! You do not need to sign in or connect your Instagram account.' },
      { question: 'Can I download carousel video slides?', answer: 'Yes, our engine identifies video streams within carousel posts.' },
    ],
  },
  'instagram-reels-downloader': {
    slug: 'instagram-reels-downloader',
    platform: 'instagram',
    platformName: 'Instagram',
    badge: 'Trending Audio & Video',
    title: 'Instagram Reels Downloader – Save IG Reels in 1080p HD',
    h1: 'Instagram Reels Downloader',
    tagline: 'The fastest way to download trending Instagram Reels with original audio in Full HD.',
    metaDescription: 'Download Instagram Reels in high definition MP4 format. Save viral IG Reels to your phone gallery with original audio for free.',
    primaryFormat: 'MP4',
    keywords: ['instagram reels downloader', 'download ig reels', 'save reels online', 'reels to mp4'],
    sampleUrl: 'https://www.instagram.com/reel/C3x9zP1LXyq/',
    features: [
      { title: 'Full 1080x1920 Framing', desc: 'Maintains 9:16 vertical ratio without black bars or letterboxing.', icon: 'Smartphone' },
      { title: 'Audio Isolation', desc: 'Save background music or voiceovers separately.', icon: 'FileAudio' },
    ],
    steps: [
      { step: 1, title: 'Copy Reel URL', desc: 'In Instagram, tap Share > Copy Link on the Reel.' },
      { step: 2, title: 'Paste & Analyze', desc: 'Paste into Goinstaller above.' },
      { step: 3, title: 'Download Instantly', desc: 'Tap Download to store the file on your device.' },
    ],
    faqs: [
      { question: 'How do I download on iPhone?', answer: 'Safari will prompt "Do you want to download?". Tap Download and find the file in Files > Downloads.' },
    ],
  },
  'tiktok-video-downloader': {
    slug: 'tiktok-video-downloader',
    platform: 'tiktok',
    platformName: 'TikTok',
    badge: 'No Watermark Option',
    title: 'TikTok Video Downloader – Download TikTok Without Watermark',
    h1: 'TikTok Video Downloader',
    tagline: 'Download TikTok videos without watermark in HD MP4 or extract original TikTok sounds to MP3.',
    metaDescription: 'Download TikTok videos without watermark for free in HD quality. Save TikTok MP4 videos and MP3 sounds on mobile, Android, iPhone, and PC.',
    primaryFormat: 'MP4',
    keywords: ['tiktok video downloader', 'tiktok without watermark', 'download tiktok video', 'tiktok to mp4', 'tiktok no watermark'],
    sampleUrl: 'https://www.tiktok.com/@creator/video/7234567890123456789',
    features: [
      { title: 'Clean, No Watermark', desc: 'Removes the bouncing TikTok watermark logo for pristine playback.', icon: 'Sparkles' },
      { title: 'Sound MP3 Extraction', desc: 'Save trending background music directly as high-bitrate MP3.', icon: 'Music' },
      { title: 'Fast CDN Delivery', desc: 'Ultra-low latency connection to global media servers.', icon: 'Zap' },
    ],
    steps: [
      { step: 1, title: 'Copy TikTok Link', desc: 'Open TikTok, tap Share button on the right, and choose Copy Link.' },
      { step: 2, title: 'Paste into Goinstaller', desc: 'Paste the link into the search input box above.' },
      { step: 3, title: 'Select No Watermark', desc: 'Select "HD (No Watermark)" to save clean video to your camera roll.' },
    ],
    faqs: [
      { question: 'Is the watermark truly removed?', answer: 'Yes, we fetch the clean source stream directly so no logo or overlay is present.' },
      { question: 'Can I download TikTok sounds as MP3?', answer: 'Yes! Select the Audio MP3 option in the format list to extract audio only.' },
    ],
  },
  'tiktok-without-watermark': {
    slug: 'tiktok-without-watermark',
    platform: 'tiktok',
    platformName: 'TikTok',
    badge: 'Pristine Clean Stream',
    title: 'TikTok Without Watermark – Save Clean HD Videos Free',
    h1: 'TikTok Without Watermark Downloader',
    tagline: 'The ultimate tool to download clean TikTok videos with zero watermark overlays.',
    metaDescription: 'Free online tool to download TikTok videos without watermark in full high-definition MP4. Safe, fast, and 100% free.',
    primaryFormat: 'MP4',
    keywords: ['tiktok without watermark', 'tiktok no watermark hd', 'save clean tiktok', 'tiktok watermark remover'],
    sampleUrl: 'https://www.tiktok.com/@creator/video/7234567890123456789',
    features: [
      { title: 'Original 1080p Resolution', desc: 'No loss of video fidelity or color saturation.', icon: 'Eye' },
      { title: 'Mobile Friendly', desc: 'Optimized for mobile touchscreens with immediate gallery saving.', icon: 'CheckCircle' },
    ],
    steps: [
      { step: 1, title: 'Copy Link', desc: 'Copy the TikTok video link from the app or browser.' },
      { step: 2, title: 'Paste Above', desc: 'Paste into Goinstaller and tap Download.' },
      { step: 3, title: 'Save MP4', desc: 'Tap Download next to No Watermark.' },
    ],
    faqs: [
      { question: 'Do you store downloaded TikToks?', answer: 'No. Goinstaller respects user privacy and never stores or archives downloaded media.' },
    ],
  },
  'twitter-video-downloader': {
    slug: 'twitter-video-downloader',
    platform: 'twitter',
    platformName: 'X (Twitter)',
    badge: 'X / Twitter Media',
    title: 'X / Twitter Video Downloader – Download Twitter Videos & GIFs',
    h1: 'X / Twitter Video Downloader',
    tagline: 'Download videos, clips, and animated GIFs from X (Twitter) in Full HD 1080p, 720p, and MP4.',
    metaDescription: 'Free Twitter video downloader. Save videos and GIFs from X (Twitter) in HD MP4 or MP3 audio. Fast, mobile-friendly, and completely free.',
    primaryFormat: 'MP4',
    keywords: ['twitter video downloader', 'x video download', 'download twitter gif', 'twitter to mp4', 'save twitter video'],
    sampleUrl: 'https://x.com/SpaceX/status/1789456123456789012',
    features: [
      { title: 'Converts GIFs to MP4', desc: 'Twitter GIFs are packaged into universal MP4 files for easy sharing.', icon: 'Film' },
      { title: 'Multi-Bitrate Options', desc: 'Choose between lightweight mobile sizes or high-bitrate 1080p.', icon: 'Layers' },
    ],
    steps: [
      { step: 1, title: 'Copy Post URL', desc: 'Tap Share below the post on X and select Copy Link.' },
      { step: 2, title: 'Paste on Goinstaller', desc: 'Paste the link above and click Download.' },
      { step: 3, title: 'Save Video', desc: 'Select 1080p or 720p to save the clip.' },
    ],
    faqs: [
      { question: 'Does this work with x.com and twitter.com links?', answer: 'Yes, both x.com and twitter.com URLs are fully supported.' },
      { question: 'Can I download Twitter Spaces audio?', answer: 'Public Spaces recordings and broadcast clips can be extracted into MP3 audio.' },
    ],
  },
  'vimeo-video-downloader': {
    slug: 'vimeo-video-downloader',
    platform: 'vimeo',
    platformName: 'Vimeo',
    badge: 'Cinema 4K UHD',
    title: 'Vimeo Video Downloader – Download Vimeo Videos in 4K & 1080p',
    h1: 'Vimeo Video Downloader',
    tagline: 'Download cinema-quality Vimeo videos in 4K Ultra HD, 1080p Full HD, and extract master soundtrack audio.',
    metaDescription: 'Free Vimeo video downloader. Download high-quality Vimeo videos in 4K, 1080p, 720p MP4 or convert soundtrack to 320kbps MP3.',
    primaryFormat: 'MP4',
    keywords: ['vimeo video downloader', 'download vimeo in 4k', 'vimeo to mp4', 'vimeo downloader online', 'save vimeo clip'],
    sampleUrl: 'https://vimeo.com/76979871',
    features: [
      { title: 'Up to 4K Cinema UHD', desc: 'Download film festival selections and motion graphics in full uncompressed resolution.', icon: 'Tv' },
      { title: 'Lossless Audio Extraction', desc: 'Isolate film scores and dialogue into high-bitrate MP3.', icon: 'Music' },
    ],
    steps: [
      { step: 1, title: 'Copy Vimeo URL', desc: 'Copy the URL of the public Vimeo video.' },
      { step: 2, title: 'Paste & Parse', desc: 'Paste into Goinstaller to fetch the high-bitrate stream options.' },
      { step: 3, title: 'Save High Res', desc: 'Click Download on 4K, 1080p, or 720p.' },
    ],
    faqs: [
      { question: 'Can I download password-protected Vimeo videos?', answer: 'We strictly support public videos where downloading is technically and legally authorized.' },
    ],
  },
  'threads-video-downloader': {
    slug: 'threads-video-downloader',
    platform: 'threads',
    platformName: 'Threads',
    badge: 'Threads by Meta',
    title: 'Threads Video Downloader – Save Threads Videos & Audio Online',
    h1: 'Threads Video Downloader',
    tagline: 'Download video clips and voice notes from Threads by Instagram in 1080p HD.',
    metaDescription: 'Download videos and audio from Threads by Meta online for free in high-definition MP4. Safe, fast, and no login required.',
    primaryFormat: 'MP4',
    keywords: ['threads video downloader', 'download threads video', 'threads to mp4', 'save threads clip'],
    sampleUrl: 'https://www.threads.net/@user/post/C4X981z29',
    features: [
      { title: 'Crisp 1080p Square & Portrait', desc: 'Maintains original aspect ratio for seamless viewing.', icon: 'CheckCircle' },
      { title: 'Audio Separation', desc: 'Download voice notes and commentary directly as MP3.', icon: 'Mic' },
    ],
    steps: [
      { step: 1, title: 'Copy Post Link', desc: 'In Threads, tap Share > Copy Link on the post.' },
      { step: 2, title: 'Paste on Goinstaller', desc: 'Paste the link into the downloader above.' },
      { step: 3, title: 'Download Video', desc: 'Select 1080p HD and save the file.' },
    ],
    faqs: [
      { question: 'Do I need the Threads app?', answer: 'No, Goinstaller works in any modern mobile or desktop web browser.' },
    ],
  },
  'youtube-shorts-downloader': {
    slug: 'youtube-shorts-downloader',
    platform: 'youtube',
    platformName: 'YouTube',
    badge: 'Vertical Shorts HD',
    title: 'YouTube Shorts Downloader – Download YouTube Shorts in Full HD',
    h1: 'YouTube Shorts Downloader',
    tagline: 'Download viral YouTube Shorts in high-definition vertical MP4 format without watermarks.',
    metaDescription: 'Download YouTube Shorts online for free in 1080p Full HD. Fast, secure, and mobile-friendly YouTube Shorts video saver.',
    primaryFormat: 'MP4',
    keywords: ['youtube shorts downloader', 'download youtube shorts', 'save shorts video', 'youtube shorts to mp4'],
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    features: [
      { title: 'Original Vertical 1080x1920', desc: 'Retains full vertical format for high-res playback.', icon: 'Video' },
      { title: 'Ultra Fast Processing', desc: 'Converts and downloads Shorts in seconds.', icon: 'Zap' },
    ],
    steps: [
      { step: 1, title: 'Copy Shorts URL', desc: 'Tap Share on any YouTube Short and copy link.' },
      { step: 2, title: 'Paste on Goinstaller', desc: 'Paste into the search field and click Download.' },
      { step: 3, title: 'Save Video', desc: 'Choose 1080p or 720p to save the clip.' },
    ],
    faqs: [
      { question: 'Can I download Shorts with audio?', answer: 'Yes, all Shorts downloads include synchronized original sound.' },
    ],
  },
  'twitter-gif-downloader': {
    slug: 'twitter-gif-downloader',
    platform: 'twitter',
    platformName: 'X (Twitter)',
    badge: 'Looping GIFs & Clips',
    title: 'Twitter GIF Downloader – Save X & Twitter Animated GIFs as MP4',
    h1: 'Twitter GIF Downloader',
    tagline: 'Convert and save looping animated GIFs and short video clips from X and Twitter in crisp MP4 format.',
    metaDescription: 'Save and convert Twitter GIFs to MP4 video files online for free. High frame-rate, no watermark, works on iPhone and Android.',
    primaryFormat: 'MP4',
    keywords: ['twitter gif downloader', 'save twitter gif', 'convert twitter gif to mp4', 'x gif download'],
    sampleUrl: 'https://x.com/SpaceX/status/1789456123456789012',
    features: [
      { title: 'Smooth 60fps MP4', desc: 'Smooth animated loop playback with universal compatibility.', icon: 'Sparkles' },
      { title: 'Zero Recompression Loss', desc: 'Maintains pixel clarity for memes and reactions.', icon: 'Eye' },
    ],
    steps: [
      { step: 1, title: 'Copy Tweet URL', desc: 'Copy the tweet URL containing the GIF or video.' },
      { step: 2, title: 'Paste and Process', desc: 'Paste into Goinstaller to parse the stream.' },
      { step: 3, title: 'Save MP4', desc: 'Download the looping MP4 file directly.' },
    ],
    faqs: [
      { question: 'Why does Twitter save GIFs as MP4?', answer: 'Twitter encodes GIFs as MP4 videos to conserve bandwidth and ensure smoother playback.' },
    ],
  },
  'tiktok-audio-downloader': {
    slug: 'tiktok-audio-downloader',
    platform: 'tiktok',
    platformName: 'TikTok',
    badge: '320kbps Music Ripper',
    title: 'TikTok Audio Downloader – Extract TikTok Sounds & Songs to MP3',
    h1: 'TikTok Audio Downloader',
    tagline: 'Extract high-fidelity original background music, viral audio clips, and voiceovers from TikTok into 320kbps MP3.',
    metaDescription: 'Extract and download TikTok background sounds, songs, and voice tracks to 320kbps MP3 for free. No app installation required.',
    primaryFormat: 'MP3',
    keywords: ['tiktok audio downloader', 'tiktok sound download', 'tiktok to mp3', 'tiktok music extractor'],
    sampleUrl: 'https://www.tiktok.com/@creator/video/7234567890123456789',
    features: [
      { title: 'Clean Audio Extraction', desc: 'Extracts purely the soundtrack with zero video bloat.', icon: 'Music' },
      { title: 'Studio 320kbps Bitrate', desc: 'Preserves dynamic acoustic range for rings and remixes.', icon: 'Headphones' },
    ],
    steps: [
      { step: 1, title: 'Copy TikTok Link', desc: 'Tap Share > Copy Link on the TikTok video.' },
      { step: 2, title: 'Paste URL', desc: 'Paste into Goinstaller to separate audio tracks.' },
      { step: 3, title: 'Download MP3', desc: 'Save the audio track directly to your device.' },
    ],
    faqs: [
      { question: 'Can I use this for ringtones?', answer: 'Yes, downloaded MP3s can be set directly as custom alarms and ringtones.' },
    ],
  },
  'instagram-story-downloader': {
    slug: 'instagram-story-downloader',
    platform: 'instagram',
    platformName: 'Instagram',
    badge: 'High Res Stories',
    title: 'Instagram Story Downloader – Save IG Stories Online in HD',
    h1: 'Instagram Story Downloader',
    tagline: 'Download public Instagram Stories and Highlights in Full HD 1080p MP4 before they expire.',
    metaDescription: 'Download public Instagram Stories and Highlights in Full HD quality for free without login. Anonymous and safe IG story saver.',
    primaryFormat: 'MP4',
    keywords: ['instagram story downloader', 'save ig story', 'download instagram stories', 'ig highlight download'],
    sampleUrl: 'https://www.instagram.com/reel/C3x9zP1LXyq/',
    features: [
      { title: 'Anonymous Saving', desc: 'Never notifies the account creator when saving public stories.', icon: 'Shield' },
      { title: 'Full 1080p Quality', desc: 'Saves full vertical canvas in high definition.', icon: 'Video' },
    ],
    steps: [
      { step: 1, title: 'Copy Story Link', desc: 'Copy the URL of the public Instagram story.' },
      { step: 2, title: 'Paste on Goinstaller', desc: 'Paste into the search field and submit.' },
      { step: 3, title: 'Save File', desc: 'Download the video or photo to your gallery.' },
    ],
    faqs: [
      { question: 'Does Goinstaller require my Instagram password?', answer: 'Never. Goinstaller only processes public URLs and never asks for credentials.' },
    ],
  },
  'facebook-reel-downloader': {
    slug: 'facebook-reel-downloader',
    platform: 'facebook',
    platformName: 'Facebook',
    badge: 'FB Reels 1080p',
    title: 'Facebook Reels Downloader – Download FB Reels in Full HD',
    h1: 'Facebook Reels Downloader',
    tagline: 'Save vertical Facebook Reels in 1080p Full HD MP4 and convert to MP3 sound files instantly.',
    metaDescription: 'Download Facebook Reels online in Full HD 1080p MP4 without watermark. Free, fast Facebook Reels saver for all devices.',
    primaryFormat: 'MP4',
    keywords: ['facebook reels downloader', 'save fb reel', 'download facebook reels', 'fb reel to mp4'],
    sampleUrl: 'https://www.facebook.com/watch/?v=10158784378129871',
    features: [
      { title: 'Original Clarity', desc: 'Maintains crisp vertical framing and vibrant color reproduction.', icon: 'CheckCircle' },
      { title: 'No Watermark', desc: 'Download clean clips for personal archiving.', icon: 'Zap' },
    ],
    steps: [
      { step: 1, title: 'Copy Reel URL', desc: 'Tap Share on the Facebook Reel and copy link.' },
      { step: 2, title: 'Paste and Detect', desc: 'Paste into Goinstaller to inspect available resolutions.' },
      { step: 3, title: 'Download HD', desc: 'Save the 1080p or 720p file to your device.' },
    ],
    faqs: [
      { question: 'Can I download Facebook Reels on mobile?', answer: 'Yes, Goinstaller works on iOS Safari, Android Chrome, and all modern mobile browsers.' },
    ],
  },
};

export function getPseoPage(slug: string): PseoPageData | undefined {
  return PSEO_PAGES[slug];
}

export function getAllPseoPages(): PseoPageData[] {
  return Array.from(Object.values(PSEO_PAGES));
}

// Scalable sitemap partitions
export function getSitemapPartitions(): {
  index: string[];
  partition1: string[];
  partition2: string[];
  partition3: string[];
} {
  const baseUrl = 'https://www.goinstaller.com';

  const partition1 = [
    baseUrl,
    `${baseUrl}/youtube-video-downloader`,
    `${baseUrl}/facebook-video-downloader`,
    `${baseUrl}/instagram-video-downloader`,
    `${baseUrl}/tiktok-video-downloader`,
    `${baseUrl}/twitter-video-downloader`,
    `${baseUrl}/vimeo-video-downloader`,
    `${baseUrl}/threads-video-downloader`,
    `${baseUrl}/about`,
    `${baseUrl}/terms`,
    `${baseUrl}/privacy`,
    `${baseUrl}/dmca`,
    `${baseUrl}/contact`,
    `${baseUrl}/sitemap`,
  ];

  const partition2 = [
    `${baseUrl}/youtube-to-mp3`,
    `${baseUrl}/tiktok-without-watermark`,
    `${baseUrl}/instagram-reels-downloader`,
    `${baseUrl}/facebook-reels-downloader`,
  ];

  // Extended programmatic landing pages for partition 3
  const partition3 = [
    `${baseUrl}/youtube-shorts-downloader`,
    `${baseUrl}/twitter-gif-downloader`,
    `${baseUrl}/tiktok-audio-downloader`,
    `${baseUrl}/instagram-story-downloader`,
    `${baseUrl}/facebook-reel-downloader`,
  ];

  const index = [
    `${baseUrl}/sitemap_1.xml`,
    `${baseUrl}/sitemap_2.xml`,
    `${baseUrl}/sitemap_3.xml`,
  ];

  return { index, partition1, partition2, partition3 };
}

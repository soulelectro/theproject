const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

// Cache for feed data (in production, use Redis)
const feedCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Get YouTube Shorts feed
router.get('/youtube-shorts', auth, async (req, res) => {
  try {
    const { limit = 20, region = 'IN' } = req.query;
    const cacheKey = `youtube-shorts-${region}-${limit}`;
    
    // Check cache first
    const cached = feedCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({ 
        videos: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp)
      });
    }

    // Fetch from YouTube API if configured
    if (process.env.YOUTUBE_API_KEY) {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: limit,
            order: 'relevance',
            type: 'video',
            videoDuration: 'short', // For YouTube Shorts
            regionCode: region,
            q: 'shorts trending viral',
            key: process.env.YOUTUBE_API_KEY
          }
        });

        const videos = response.data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          platform: 'youtube'
        }));

        // Cache the results
        feedCache.set(cacheKey, {
          data: videos,
          timestamp: Date.now()
        });

        res.json({ 
          videos,
          cached: false,
          lastUpdated: new Date()
        });

      } catch (apiError) {
        console.error('YouTube API error:', apiError.response?.data || apiError.message);
        
        // Fallback to mock data
        const mockVideos = generateMockYouTubeShorts(parseInt(limit));
        res.json({ 
          videos: mockVideos,
          cached: false,
          mock: true,
          message: 'Using mock data - YouTube API not configured'
        });
      }
    } else {
      // No API key - return mock data
      const mockVideos = generateMockYouTubeShorts(parseInt(limit));
      res.json({ 
        videos: mockVideos,
        cached: false,
        mock: true,
        message: 'Using mock data - YouTube API key not configured'
      });
    }

  } catch (error) {
    console.error('Get YouTube Shorts error:', error);
    res.status(500).json({ error: 'Failed to get YouTube Shorts feed' });
  }
});

// Get Instagram Reels feed
router.get('/instagram-reels', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const cacheKey = `instagram-reels-${limit}`;
    
    // Check cache first
    const cached = feedCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({ 
        reels: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp)
      });
    }

    // Instagram API is complex and requires business verification
    // For now, we'll use mock data that simulates Instagram Reels
    const mockReels = generateMockInstagramReels(parseInt(limit));
    
    // Cache the results
    feedCache.set(cacheKey, {
      data: mockReels,
      timestamp: Date.now()
    });

    res.json({ 
      reels: mockReels,
      cached: false,
      mock: true,
      message: 'Using mock data - Instagram API requires business verification',
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get Instagram Reels error:', error);
    res.status(500).json({ error: 'Failed to get Instagram Reels feed' });
  }
});

// Get mixed feed (YouTube + Instagram)
router.get('/mixed', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const halfLimit = Math.ceil(limit / 2);

    // Get both feeds concurrently
    const [youtubeResponse, instagramResponse] = await Promise.allSettled([
      axios.get(`${req.protocol}://${req.get('host')}/api/feed/youtube-shorts?limit=${halfLimit}`, {
        headers: { Authorization: req.headers.authorization }
      }),
      axios.get(`${req.protocol}://${req.get('host')}/api/feed/instagram-reels?limit=${halfLimit}`, {
        headers: { Authorization: req.headers.authorization }
      })
    ]);

    const youtubeVideos = youtubeResponse.status === 'fulfilled' ? 
      youtubeResponse.value.data.videos || [] : [];
    const instagramReels = instagramResponse.status === 'fulfilled' ? 
      instagramResponse.value.data.reels || [] : [];

    // Mix the content
    const mixedFeed = [];
    const maxLength = Math.max(youtubeVideos.length, instagramReels.length);
    
    for (let i = 0; i < maxLength && mixedFeed.length < limit; i++) {
      if (i < youtubeVideos.length) {
        mixedFeed.push(youtubeVideos[i]);
      }
      if (i < instagramReels.length && mixedFeed.length < limit) {
        mixedFeed.push(instagramReels[i]);
      }
    }

    res.json({
      feed: mixedFeed,
      totalItems: mixedFeed.length,
      sources: {
        youtube: youtubeVideos.length,
        instagram: instagramReels.length
      },
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Get mixed feed error:', error);
    res.status(500).json({ error: 'Failed to get mixed feed' });
  }
});

// Clear feed cache
router.delete('/cache', auth, async (req, res) => {
  try {
    feedCache.clear();
    res.json({ message: 'Feed cache cleared successfully' });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Get trending hashtags
router.get('/trending-hashtags', auth, async (req, res) => {
  try {
    // Mock trending hashtags (in production, this could be from a real API or database)
    const trendingHashtags = [
      { tag: '#viral', count: 1250000 },
      { tag: '#trending', count: 980000 },
      { tag: '#reels', count: 850000 },
      { tag: '#shorts', count: 720000 },
      { tag: '#funny', count: 650000 },
      { tag: '#dance', count: 580000 },
      { tag: '#comedy', count: 520000 },
      { tag: '#music', count: 480000 },
      { tag: '#memes', count: 420000 },
      { tag: '#lifestyle', count: 380000 }
    ];

    res.json({ hashtags: trendingHashtags });
  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({ error: 'Failed to get trending hashtags' });
  }
});

// Helper function to generate mock YouTube Shorts
function generateMockYouTubeShorts(limit) {
  const mockTitles = [
    "Amazing Life Hack That Will Blow Your Mind! 🤯",
    "This Dance Move is Going Viral! 💃",
    "You Won't Believe What Happens Next...",
    "Quick Recipe That Takes 2 Minutes! 🍳",
    "Funny Pet Compilation 2024 😂",
    "Mind-Blowing Science Experiment! 🧪",
    "Street Food That Looks Incredible! 🌮",
    "This Magic Trick is Impossible! ✨",
    "Epic Fail Compilation 😅",
    "Beautiful Nature Time-lapse 🌅",
    "Satisfying Art Creation Process 🎨",
    "Incredible Athletic Performance! 🏃",
    "Cute Baby Animals Being Adorable 🐱",
    "Amazing Technology Innovation! 📱",
    "Delicious Food Challenge! 🍕"
  ];

  const mockChannels = [
    "ViralContent", "TrendingNow", "QuickVids", "FunnyMoments", 
    "LifeHacks101", "DanceVibes", "FoodieShorts", "TechTrends",
    "NatureWonders", "ArtisticVibes", "SportsHighlights", "PetLovers"
  ];

  const videos = [];
  for (let i = 0; i < limit; i++) {
    const randomTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const randomChannel = mockChannels[Math.floor(Math.random() * mockChannels.length)];
    const videoId = `mock_yt_${Date.now()}_${i}`;
    
    videos.push({
      id: videoId,
      title: randomTitle,
      description: `${randomTitle} - Watch this amazing short video!`,
      thumbnail: `https://picsum.photos/320/180?random=${i}`,
      channelTitle: randomChannel,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      platform: 'youtube',
      mock: true
    });
  }
  
  return videos;
}

// Helper function to generate mock Instagram Reels
function generateMockInstagramReels(limit) {
  const mockCaptions = [
    "Living my best life! ✨ #lifestyle #vibes",
    "This outfit is everything! 👗 #fashion #ootd",
    "Can't stop dancing to this song! 💃 #dance #music",
    "Sunset vibes are unmatched 🌅 #sunset #nature",
    "Trying this new recipe! 🍰 #cooking #food",
    "Workout motivation! 💪 #fitness #gym",
    "Art in progress... 🎨 #art #creative",
    "Travel memories! ✈️ #travel #adventure",
    "Self-care Sunday! 🧘‍♀️ #selfcare #wellness",
    "Friends forever! 👯‍♀️ #friendship #fun",
    "New hairstyle, new me! 💇‍♀️ #hair #transformation",
    "Coffee and good vibes ☕ #coffee #morning",
    "Weekend adventures! 🏔️ #weekend #explore",
    "Bookworm life 📚 #reading #books",
    "Making memories! 📸 #memories #life"
  ];

  const mockUsernames = [
    "aesthetic_vibes", "daily_inspo", "creative_soul", "adventure_seeker",
    "fashion_lover", "foodie_life", "fitness_journey", "art_therapy",
    "travel_diaries", "music_addict", "nature_lover", "lifestyle_guru"
  ];

  const reels = [];
  for (let i = 0; i < limit; i++) {
    const randomCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];
    const randomUsername = mockUsernames[Math.floor(Math.random() * mockUsernames.length)];
    const reelId = `mock_ig_${Date.now()}_${i}`;
    
    reels.push({
      id: reelId,
      caption: randomCaption,
      username: randomUsername,
      thumbnail: `https://picsum.photos/320/568?random=${i + 100}`,
      likes: Math.floor(Math.random() * 10000) + 100,
      comments: Math.floor(Math.random() * 500) + 10,
      shares: Math.floor(Math.random() * 200) + 5,
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: `https://www.instagram.com/reel/${reelId}`,
      platform: 'instagram',
      mock: true
    });
  }
  
  return reels;
}

module.exports = router;
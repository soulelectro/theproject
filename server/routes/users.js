const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, upiId, socialLinks, profilePicture } = req.body;
    const user = req.user;

    // Check if username is already taken (if changing)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (upiId !== undefined) user.upiId = upiId;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    if (socialLinks) {
      user.socialLinks = { ...user.socialLinks, ...socialLinks };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        upiId: user.upiId,
        socialLinks: user.socialLinks,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        { isActive: true }, // Only active users
        {
          $or: [
            { username: searchRegex },
            { phoneNumber: searchRegex }
          ]
        }
      ]
    })
    .select('username phoneNumber profilePicture bio socialLinks followers following')
    .limit(parseInt(limit));

    // Add follow status for each user
    const usersWithFollowStatus = users.map(user => ({
      id: user._id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      bio: user.bio,
      socialLinks: user.socialLinks,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: req.user.following.includes(user._id),
      isFollower: user.followers.includes(req.user._id)
    }));

    res.json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username phoneNumber profilePicture bio socialLinks followers following createdAt')
      .populate('followers following', 'username profilePicture');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        bio: user.bio,
        socialLinks: user.socialLinks,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: req.user.following.includes(user._id),
        isFollower: user.followers.includes(req.user._id),
        joinedAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Follow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: 'User followed successfully',
      isFollowing: true,
      followersCount: userToFollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if not following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await userToUnfollow.save();

    res.json({
      message: 'User unfollowed successfully',
      isFollowing: false,
      followersCount: userToUnfollow.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers
router.get('/:userId/followers', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'followers',
        select: 'username profilePicture bio',
        options: { limit: parseInt(limit) }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followersWithStatus = user.followers.map(follower => ({
      id: follower._id,
      username: follower.username,
      profilePicture: follower.profilePicture,
      bio: follower.bio,
      isFollowing: req.user.following.includes(follower._id),
      isFollower: follower._id.toString() !== req.user._id.toString() ? 
        req.user.followers.includes(follower._id) : false
    }));

    res.json({ followers: followersWithStatus });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get following
router.get('/:userId/following', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'following',
        select: 'username profilePicture bio',
        options: { limit: parseInt(limit) }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingWithStatus = user.following.map(followedUser => ({
      id: followedUser._id,
      username: followedUser.username,
      profilePicture: followedUser.profilePicture,
      bio: followedUser.bio,
      isFollowing: req.user.following.includes(followedUser._id),
      isFollower: followedUser._id.toString() !== req.user._id.toString() ? 
        req.user.followers.includes(followedUser._id) : false
    }));

    res.json({ following: followingWithStatus });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// Get suggested users to follow
router.get('/suggestions/follow', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentUser = req.user;

    // Find users that current user is not following
    const suggestions = await User.find({
      $and: [
        { _id: { $ne: currentUser._id } },
        { _id: { $nin: currentUser.following } },
        { isActive: true }
      ]
    })
    .select('username profilePicture bio socialLinks followers')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 }); // Show newer users first

    const suggestionsWithInfo = suggestions.map(user => ({
      id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      socialLinks: user.socialLinks,
      followersCount: user.followers.length,
      mutualFollowers: user.followers.filter(followerId => 
        currentUser.following.includes(followerId)
      ).length
    }));

    res.json({ suggestions: suggestionsWithInfo });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
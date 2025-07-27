package com.temporarysocial.app.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.datetime.Instant

@Parcelize
data class User(
    val id: String,
    val phoneNumber: String,
    val username: String,
    val sessionStartTime: Instant,
    val sessionEndTime: Instant,
    val isActive: Boolean = true,
    val upiId: String? = null,
    val socialLinks: SocialLinks = SocialLinks(),
    val followers: List<String> = emptyList(),
    val following: List<String> = emptyList(),
    val profilePicture: String? = null,
    val bio: String = "",
    val lastActive: Instant,
    val otpVerified: Boolean = false
) : Parcelable {
    
    val sessionTimeRemaining: SessionTime
        get() {
            val now = kotlinx.datetime.Clock.System.now()
            val remaining = sessionEndTime.minus(now)
            
            if (remaining.inWholeMilliseconds <= 0) {
                return SessionTime(0, 0, 0, expired = true)
            }
            
            val hours = remaining.inWholeHours.toInt()
            val minutes = (remaining.inWholeMinutes % 60).toInt()
            val seconds = (remaining.inWholeSeconds % 60).toInt()
            
            return SessionTime(hours, minutes, seconds, expired = false)
        }
    
    val isSessionExpired: Boolean
        get() = kotlinx.datetime.Clock.System.now() > sessionEndTime
    
    val followersCount: Int
        get() = followers.size
    
    val followingCount: Int
        get() = following.size
}

@Parcelize
data class SocialLinks(
    val instagram: String? = null,
    val discord: String? = null,
    val reddit: String? = null,
    val snapchat: String? = null,
    val twitter: String? = null
) : Parcelable

@Parcelize
data class SessionTime(
    val hours: Int,
    val minutes: Int,
    val seconds: Int,
    val expired: Boolean = false
) : Parcelable {
    
    val totalMinutes: Int
        get() = hours * 60 + minutes
    
    val isExpiringSoon: Boolean
        get() = totalMinutes <= 30
    
    val isCritical: Boolean
        get() = totalMinutes <= 10
    
    override fun toString(): String {
        return "${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}"
    }
}
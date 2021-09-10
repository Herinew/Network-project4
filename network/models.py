from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    followers = models.ManyToManyField(User, blank=True, related_name='followers_profile')

    def serialize(self, user):
        return {
            "profile_id": self.user.id,
            "profile_username": self.user.username,
            "profile_followers": self.followers.count(),
            "profile_following": self.user.followers_profile.count(),
            "is_following": not user.is_anonymous and self in user.followers_profile.all(),
            "follow_available": (not user.is_anonymous) and self.user != user
        }

class Post(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.PROTECT, related_name="posts")
    text = models.CharField("Post", max_length=300)
    date = models.DateTimeField("Created", auto_now_add=True)
    likes = models.ManyToManyField(Profile, blank=True, related_name="liked_posts")

    def serialize(self, user):
        return {
            "id": self.id,
            "text": self.text,
            "date": self.date.strftime("%b %#d %Y, %#I:%M %p"),
            "user_id": self.user.id,
            "username": self.user.user.username,
            "likes": self.likes.count(),
            "liked": not user.is_anonymous and self in Profile.objects.filter(user=user).first().liked_posts.all(),
            "aviable_to_edit": self.user.user == user
        }









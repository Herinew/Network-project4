
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts", views.all_posts, name="all_posts"),
    path("posts/new", views.new_post, name="new_post"),
    path("posts/followed", views.followed_posts, name="followed_posts"),
    path("profile/<int:id>", views.profile, name="profile"),
    path("profile/<int:id>/follow", views.follow, name="follow"),
    path("posts/<int:id>/like", views.like, name="like")
]
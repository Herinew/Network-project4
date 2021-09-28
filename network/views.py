from django import http
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.core.paginator import Paginator
from django.core import serializers
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import Profile, Post, User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            Profile(user=user).save()
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def all_posts(request):
    user_profile = request.GET.get("user_profile", None)
    if user_profile:
        posts = Post.objects.filter(user=user_profile).all()
    else:
        posts = Post.objects.all()    
    posts = posts.order_by("-date").all()  
    paginator = Paginator(posts, 10)
    page_obj = paginator.get_page(request.GET["page"])
    return JsonResponse({
        "posts": [post.serialize(request.user) for post in page_obj],
        "num_pages": paginator.num_pages}, safe=False)



def new_post(request):

    if request.method == 'POST':
        post = Post(text=request.POST["text"])
        post.user = Profile.objects.get(user=request.user)
        post.save()

    elif request.method == 'PUT':
        data = json.loads(request.body)
        post_id = int(data["id"])
        text = data["text"]
        post = Post.objects.get(id=post_id)

        if post.user.user != request.user:
            return HttpResponse(status=401)

        post.text = text
        post.save()
        return JsonResponse({"success": True}, status=200)

    else:
        return JsonResponse({"error": "Only request method aviable POST, PUT"})

    return index(request)


def profile(request, id):
    profile = Profile.objects.get(id=id)
    return JsonResponse(profile.serialize(request.user), status=200)



def followed_posts(request):
    followed = request.user.followers_profile.all()
    posts = Post.objects.filter(user__in=followed).all()
    posts = posts.order_by("-date").all()  
    paginator = Paginator(posts, 10)
    page_obj = paginator.get_page(request.GET["page"])
    return JsonResponse({
        "posts": [post.serialize(request.user) for post in page_obj],
        "num_pages": paginator.num_pages}, safe=False)


def follow(request, id):
    profile = Profile.objects.get(id=id)
    if profile in request.user.followers_profile.all():
        profile.followers.remove(request.user)
        follow = False
    else:
        profile.followers.add(request.user)
        follow = True
    profile.save()
    num_followers = profile.followers.count()
    return JsonResponse({"follow": follow, "followers": num_followers}, status=200)


def like(request, id):
    post = Post.objects.get(id=id)
    profile = Profile.objects.get(user=request.user)
    if post in profile.liked_posts.all():
        post.likes.remove(profile)
        like = False
    else:
        post.likes.add(profile)
        like = True
    post.save()
    num_likes = post.likes.count()
    return JsonResponse({"like": like, "num_likes": num_likes}, status=200)


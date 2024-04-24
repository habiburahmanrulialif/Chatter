from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import User, Group, Message
from django.urls import reverse
from django.db import IntegrityError
from .serializers import GroupSerializer, MessageSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404

# Create your views here.
@login_required
def index(request):
    return render(request, "chat/index.html", {'user':request.user})


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "chat/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "chat/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "chat/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(email, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "chat/register.html", {
                "message": "Email address already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "chat/register.html")


#Create group without member
@csrf_exempt
@api_view(['POST'])
def create_group(request):
    if request.method == 'POST':
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            instance.group_member.add(request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#add member
@api_view(['POST'])
def add_member(request, groupName, userName):
    group = get_object_or_404(Group,  group_name=groupName)
    user = get_object_or_404(User, username=userName)
    group.group_member.add(user)
    group.update_newest_message_time()
    return Response(status=status.HTTP_200_OK)


#retreieve group
@api_view(['GET'])
def retrieve_group(request):
    if request.method == 'GET':
        groups = Group.objects.filter(group_member=request.user).order_by('-newest_message_time')
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data, content_type='application/json')


#retrieve chat
@api_view(['GET'])
def retrieve_chat(request, groupName):
    if request.method == 'GET':
        group = get_object_or_404(Group, group_name=groupName)
        message = Message.objects.filter(part_of_group=group)
        serializer = MessageSerializer(message, many=True)
        return Response(serializer.data, content_type='application/json')


#send chat
@csrf_exempt
@api_view(['POST'])
def new_message(request, groupName):
    if request.method == 'POST':
        # Retrieve the group object
        group = get_object_or_404(Group, group_name=groupName)

        # Ensure the user sending the message is a member of the group
        if request.user not in group.group_member.all():
            return Response({'error': 'You are not a member of this group.'}, status=status.HTTP_403_FORBIDDEN)

        # Retrieve message content from request data
        message_content = request.data.get('content', '')

        # Create a new message instance
        message = Message(part_of_group=group, sender=request.user, message=message_content)
        message.save()

        # Update the newest message time of the group
        group.update_newest_message_time()

        # Serialize the message and send response
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Only POST requests are allowed for this endpoint.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

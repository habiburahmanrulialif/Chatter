from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API
    path("group", views.retrieve_group, name="retrieve_group"),
    path("group/create", views.create_group, name="create_group"),
    path("group/<str:groupName>", views.retrieve_chat, name="retrieve_chat"),
    path("group/<str:groupName>/addMember/<str:userName>", views.add_member, name="add_member"),
    path("group/<str:groupName>/newMessage", views.new_message, name="new_message"),
]

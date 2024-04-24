from rest_framework import serializers
from .models import Group, Message


class GroupSerializer(serializers.ModelSerializer):

    group_member = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'group_name', 'group_member', 'newest_message_time']

    def get_group_member(self, obj):
        return [member.username for member in obj.group_member.all()]


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'part_of_group', 'sender', 'message', 'created_at']

    def get_sender(self, obj):
        sender = obj.sender
        return sender.username
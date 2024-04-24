from django.contrib import admin
from .models import User, Group, Message
from django import forms

class GroupAdmin(admin.ModelAdmin):
    readonly_fields = ("id", )

class MessageAdminForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            # If the Message instance already exists, restrict choices for sender based on the group
            self.fields['sender'].queryset = self.fields['sender'].queryset.filter(chat_group=self.instance.part_of_group)

class MessageAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)
    form = MessageAdminForm

admin.site.register(User)
admin.site.register(Group, GroupAdmin)
admin.site.register(Message, MessageAdmin)
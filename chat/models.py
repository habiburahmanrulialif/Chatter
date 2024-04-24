from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class User(AbstractUser):
    
    pass

class Group(models.Model):
    group_name = models.CharField(max_length=50, blank=False, null=False)
    group_member = models.ManyToManyField("User", related_name="chat_group", blank=True)
    newest_message_time = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.group_name
    
    def update_newest_message_time(self):
        newest_message = self.member_of.order_by('-created_at').first()
        if newest_message:
            self.newest_message_time = newest_message.created_at
            self.save()

class Message(models.Model):
    part_of_group = models.ForeignKey("Group", on_delete=models.CASCADE, related_name="member_of")
    sender =  models.ForeignKey("User", on_delete=models.CASCADE)
    message = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.part_of_group.update_newest_message_time()
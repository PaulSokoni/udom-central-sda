from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    audience_display = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['author']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.get_full_name() or obj.author.username
        return None

    def get_priority_display(self, obj):
        return obj.get_priority_display()

    def get_audience_display(self, obj):
        return obj.get_audience_display()

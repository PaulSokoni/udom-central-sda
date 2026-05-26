from rest_framework import serializers
from .models import PrayerRequest


class PrayerRequestSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = PrayerRequest
        fields = '__all__'
        read_only_fields = ['member']

    def get_member_name(self, obj):
        if obj.is_anonymous:
            return 'Anonymous'
        return obj.member.full_name()

    def get_category_display(self, obj):
        return obj.get_category_display()

    def get_status_display(self, obj):
        return obj.get_status_display()


class PrayerRequestSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrayerRequest
        fields = ['category', 'request', 'is_anonymous']

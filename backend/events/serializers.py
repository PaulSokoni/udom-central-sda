from rest_framework import serializers
from .models import Event, EventAttendance, Visitor


class EventSerializer(serializers.ModelSerializer):
    event_type_display = serializers.SerializerMethodField()
    organizer_name = serializers.SerializerMethodField()
    attendance_count = serializers.SerializerMethodField()
    visitor_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_event_type_display(self, obj):
        return obj.get_event_type_display()

    def get_organizer_name(self, obj):
        return obj.organizer.full_name() if obj.organizer else None

    def get_attendance_count(self, obj):
        return obj.attendances.filter(is_visitor=False).count()

    def get_visitor_count(self, obj):
        return obj.attendances.filter(is_visitor=True).count()


class EventAttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    member_id_code = serializers.SerializerMethodField()

    class Meta:
        model = EventAttendance
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name() if obj.member else None

    def get_member_id_code(self, obj):
        return obj.member.member_id if obj.member else None


class VisitorSerializer(serializers.ModelSerializer):
    event_title = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = '__all__'

    def get_event_title(self, obj):
        return obj.event.title if obj.event else None


class VisitorSelfRegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=100, min_length=2)
    phone = serializers.CharField(max_length=20, allow_blank=True, required=False)
    email = serializers.EmailField(max_length=254, allow_blank=True, required=False)
    home_church = serializers.CharField(max_length=100, allow_blank=True, required=False)
    address = serializers.CharField(max_length=200, allow_blank=True, required=False)
    notes = serializers.CharField(max_length=500, allow_blank=True, required=False)

    class Meta:
        model = Visitor
        fields = ['name', 'phone', 'email', 'home_church', 'address', 'event', 'visit_date', 'wants_followup', 'notes']

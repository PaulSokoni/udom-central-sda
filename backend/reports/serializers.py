from rest_framework import serializers
from .models import AttendanceRecord, TitheOffering, BibleStudyRecord, BaptismRecord, MonthlyReport
import calendar


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    service_display = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name()

    def get_service_display(self, obj):
        return obj.get_service_type_display()


class TitheOfferingSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = TitheOffering
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name()

    def get_category_display(self, obj):
        return obj.get_category_display()


class BibleStudySerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()

    class Meta:
        model = BibleStudyRecord
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name()


class BaptismRecordSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    record_type_display = serializers.SerializerMethodField()

    class Meta:
        model = BaptismRecord
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name()

    def get_record_type_display(self, obj):
        return obj.get_record_type_display()


class MonthlyReportSerializer(serializers.ModelSerializer):
    month_name = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyReport
        fields = '__all__'

    def get_month_name(self, obj):
        return obj.month_name()

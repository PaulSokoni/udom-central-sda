from rest_framework import serializers
from .models import Pledge, IncomeRecord, ExpenseRecord, FinancialSummary


class PledgeSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Pledge
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_balance(self, obj):
        return float(obj.amount) - float(obj.amount_paid)


class IncomeRecordSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = IncomeRecord
        fields = '__all__'

    def get_member_name(self, obj):
        return obj.member.full_name() if obj.member else None

    def get_category_display(self, obj):
        return obj.get_category_display()


class ExpenseRecordSerializer(serializers.ModelSerializer):
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseRecord
        fields = '__all__'

    def get_category_display(self, obj):
        return obj.get_category_display()


class FinancialSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialSummary
        fields = '__all__'

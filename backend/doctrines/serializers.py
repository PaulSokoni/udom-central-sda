from rest_framework import serializers
from .models import Doctrine


class DoctrineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctrine
        fields = '__all__'

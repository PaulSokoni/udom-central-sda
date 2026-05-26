from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from members.permissions import IsPastorOrAdmin
from .models import Doctrine
from .serializers import DoctrineSerializer


class DoctrineViewSet(viewsets.ModelViewSet):
    queryset = Doctrine.objects.all()
    serializer_class = DoctrineSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

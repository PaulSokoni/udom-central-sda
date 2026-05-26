from django.contrib import admin
from .models import Event, EventAttendance, Visitor

admin.site.register(Event)
admin.site.register(EventAttendance)
admin.site.register(Visitor)

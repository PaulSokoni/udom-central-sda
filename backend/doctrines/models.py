from django.db import models


class Doctrine(models.Model):
    number = models.PositiveIntegerField(unique=True)
    title = models.CharField(max_length=200)
    summary = models.TextField()
    full_explanation = models.TextField(blank=True)
    scripture_references = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.number}. {self.title}'

    class Meta:
        ordering = ['number']

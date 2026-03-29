from rest_framework import serializers
from .models import Nota, NotaFinal, Recuperacion


class NotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nota
        fields = '__all__'


class NotaFinalSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotaFinal
        fields = '__all__'


class RecuperacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recuperacion
        fields = '__all__'
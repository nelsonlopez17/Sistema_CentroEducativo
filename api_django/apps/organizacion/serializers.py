from rest_framework import serializers
from .models import CicloEscolar, Unidad, GradoSeccion


class CicloEscolarSerializer(serializers.ModelSerializer):
    class Meta:
        model = CicloEscolar
        fields = '__all__'


class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'


class GradoSeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradoSeccion
        fields = '__all__'
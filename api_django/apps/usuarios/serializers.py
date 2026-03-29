from rest_framework import serializers
from .models import Persona, Telefono, Usuario, Rol, UsuarioRol


class TelefonoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telefono
        fields = '__all__'


class PersonaSerializer(serializers.ModelSerializer):
    telefonos = TelefonoSerializer(many=True, required=False)

    class Meta:
        model = Persona
        fields = '__all__'

    def create(self, validated_data):
        telefonos_data = validated_data.pop('telefonos', [])
        persona = Persona.objects.create(**validated_data)

        for telefono in telefonos_data:
            Telefono.objects.create(persona=persona, **telefono)

        return persona


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields = '__all__'
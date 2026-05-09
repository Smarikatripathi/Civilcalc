from rest_framework import serializers
from .models import Converter, File, Question, Resource, SubItem, User, Calculator

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'profile_image']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class SubItemSerializer(serializers.ModelSerializer):
    files = FileSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = SubItem
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    subitems = SubItemSerializer(many=True, read_only=True)

    class Meta:
        model = Resource
        fields = '__all__'


class CalculatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calculator
        fields = '__all__'


class ConverterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Converter
        fields = '__all__'       
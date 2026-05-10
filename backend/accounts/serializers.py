from rest_framework import serializers
from .models import (
    Calculator,
    Chapter,
    ContentBlock,
    Converter,
    File,
    Question,
    Resource,
    SubItem,
    User,
)

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
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = '__all__'

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.url


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class ContentBlockSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ContentBlock
        fields = '__all__'

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            url = obj.file.url
            return request.build_absolute_uri(url) if request else url
        return obj.external_url


class ChapterSerializer(serializers.ModelSerializer):
    content_blocks = ContentBlockSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = '__all__'


class SubItemSerializer(serializers.ModelSerializer):
    files = FileSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    chapters = ChapterSerializer(many=True, read_only=True)
    content_blocks = ContentBlockSerializer(many=True, read_only=True)

    class Meta:
        model = SubItem
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    subitems = SubItemSerializer(many=True, read_only=True)
    chapters = ChapterSerializer(many=True, read_only=True)
    content_blocks = ContentBlockSerializer(many=True, read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = '__all__'

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if not obj.thumbnail:
            return None
        url = obj.thumbnail.url
        return request.build_absolute_uri(url) if request else url

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        if not obj.pdf_file:
            return None
        url = obj.pdf_file.url
        return request.build_absolute_uri(url) if request else url


class CalculatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calculator
        fields = '__all__'


class ConverterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Converter
        fields = '__all__'       

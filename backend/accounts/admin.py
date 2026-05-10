from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Calculator,
    CalculatorInput,
    Chapter,
    ContentBlock,
    ConversionUnit,
    Converter,
    File,
    Question,
    Resource,
    Section,
    User,
)

admin.site.register(User, UserAdmin)


class SectionInline(admin.TabularInline):
    model = Section
    extra = 1
    fields = ('title', 'slug', 'description', 'icon', 'image', 'order')
    prepopulated_fields = {'slug': ('title',)}


class DirectChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    fields = ('title', 'slug', 'description', 'section', 'order')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_mode', 'category', 'region', 'updated_at')
    list_filter = ('content_mode', 'category', 'region')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [SectionInline, DirectChapterInline]


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 1
    fields = ('title', 'slug', 'description', 'order')
    prepopulated_fields = {'slug': ('title',)}


class FileInline(admin.TabularInline):
    model = File
    extra = 1
    fields = ('title', 'type', 'file', 'url', 'order')


class SectionContentBlockInline(admin.TabularInline):
    model = ContentBlock
    extra = 1
    fields = ('title', 'block_type', 'chapter', 'body', 'file', 'external_url', 'order')


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = (
        'question_text',
        'chapter',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_answer',
        'explanation',
        'order',
    )


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource', 'order')
    list_filter = ('resource',)
    search_fields = ('title', 'description', 'resource__title')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ChapterInline, FileInline, SectionContentBlockInline, QuestionInline]


class ChapterContentBlockInline(admin.TabularInline):
    model = ContentBlock
    extra = 1
    fields = ('title', 'block_type', 'body', 'file', 'external_url', 'order')


class ChapterQuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = (
        'question_text',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_answer',
        'explanation',
        'order',
    )


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource', 'section', 'order')
    list_filter = ('resource', 'section')
    search_fields = ('title', 'description', 'resource__title', 'section__title')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ChapterContentBlockInline, ChapterQuestionInline]


@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    list_display = ('title', 'block_type', 'resource', 'section', 'chapter', 'order')
    list_filter = ('block_type', 'resource', 'section')
    search_fields = ('title', 'body')


@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'section', 'order')
    list_filter = ('type', 'section__resource')
    search_fields = ('title',)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'section', 'chapter', 'correct_answer', 'order')
    list_filter = ('section__resource', 'section', 'chapter')
    search_fields = ('question_text',)

admin.site.register(Calculator)
admin.site.register(CalculatorInput)

admin.site.register(Converter)
admin.site.register(ConversionUnit)    

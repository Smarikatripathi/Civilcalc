from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import ConversionUnit, Converter, File, Resource, SubItem, User, Calculator, CalculatorInput

admin.site.register(User, UserAdmin)


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'region', 'updated_at')
    search_fields = ('title',)

admin.site.register(SubItem)
admin.site.register(File)

admin.site.register(Calculator)
admin.site.register(CalculatorInput)

admin.site.register(Converter)
admin.site.register(ConversionUnit)    
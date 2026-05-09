from django.db import migrations, models
from django.utils.text import slugify


def generate_slugs(apps, schema_editor):
    Resource = apps.get_model('accounts', 'Resource')
    SubItem = apps.get_model('accounts', 'SubItem')

    for resource in Resource.objects.all():
        if not resource.slug:
            base_slug = slugify(resource.title)
            slug = base_slug
            count = 1
            while Resource.objects.filter(slug=slug).exclude(pk=resource.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            resource.slug = slug
            resource.save(update_fields=['slug'])

    for subitem in SubItem.objects.all():
        if not subitem.slug:
            base_slug = slugify(subitem.title)
            slug = base_slug
            count = 1
            while SubItem.objects.filter(resource=subitem.resource, slug=slug).exclude(pk=subitem.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            subitem.slug = slug
            subitem.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_calculator_converter_calculatorinput_conversionunit_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='slug',
            field=models.SlugField(blank=True, null=True, max_length=255, unique=True),
        ),
        migrations.AddField(
            model_name='subitem',
            name='slug',
            field=models.SlugField(blank=True, null=True, max_length=255),
        ),
        migrations.RunPython(generate_slugs, reverse_code=migrations.RunPython.noop),
    ]

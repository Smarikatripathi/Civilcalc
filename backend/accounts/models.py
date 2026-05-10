from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from ckeditor.fields import RichTextField

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
# models.py

class Resource(models.Model):
    CONTENT_MODE_CHOICES = [
        ("direct", "Direct content page"),
        ("sections", "Open sections first"),
    ]

    CATEGORY_CHOICES = [
        ("codes", "Codes"),
        ("district_rates", "District Rates"),
        ("rules", "Rules and Regulations"),
        ("notes", "Notes"),
        ("blogs", "Blogs"),
    ]

    REGION_CHOICES = [
        ("nepal", "Nepal"),
        ("india", "India"),
        ("us", "US"),
        ("europe", "Europe"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    description = RichTextField()
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=50)
    region = models.CharField(choices=REGION_CHOICES, max_length=50)
    content_mode = models.CharField(
        choices=CONTENT_MODE_CHOICES,
        max_length=20,
        default="sections",
    )
    thumbnail = models.ImageField(upload_to='resources/thumbnails/', null=True, blank=True)
    pdf_file = models.FileField(upload_to='resources/pdfs/', null=True, blank=True)
    sub_items_count = models.IntegerField(default=0)
    updated_at = models.DateField(auto_now=True)
    link = models.URLField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            while Resource.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

class SubItem(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="subitems")
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='resources/sections/', null=True, blank=True)
    icon = models.CharField(max_length=80, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [models.Index(fields=['slug'])]
        ordering = ['order', 'id']

    def save(self, *args, **kwargs):
        if not self.slug and self.title and self.resource_id:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            while SubItem.objects.filter(resource=self.resource, slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Chapter(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="chapters")
    section = models.ForeignKey(
        SubItem,
        on_delete=models.CASCADE,
        related_name="chapters",
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['resource', 'slug']),
            models.Index(fields=['section', 'slug']),
        ]

    def save(self, *args, **kwargs):
        if self.section_id and not self.resource_id:
            self.resource = self.section.resource

        if not self.slug and self.title and self.resource_id:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            queryset = Chapter.objects.filter(resource=self.resource, slug=slug)
            if self.section_id:
                queryset = queryset.filter(section=self.section)
            while queryset.exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
                queryset = Chapter.objects.filter(resource=self.resource, slug=slug)
                if self.section_id:
                    queryset = queryset.filter(section=self.section)
            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ContentBlock(models.Model):
    BLOCK_TYPE_CHOICES = [
        ("note", "Note"),
        ("formula", "Formula"),
        ("pdf", "PDF"),
        ("embed", "Embedded material"),
        ("practice", "Practice question"),
        ("video", "Video"),
    ]

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="content_blocks")
    section = models.ForeignKey(
        SubItem,
        on_delete=models.CASCADE,
        related_name="content_blocks",
        blank=True,
        null=True,
    )
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name="content_blocks",
        blank=True,
        null=True,
    )
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = RichTextField(blank=True, null=True)
    file = models.FileField(upload_to='resources/content/', blank=True, null=True)
    external_url = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def save(self, *args, **kwargs):
        if self.chapter_id:
            self.resource = self.chapter.resource
            if self.chapter.section_id and not self.section_id:
                self.section = self.chapter.section
        elif self.section_id and not self.resource_id:
            self.resource = self.section.resource

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_block_type_display()}: {self.title}"

class File(models.Model):
    TYPE_CHOICES = [
        ("PDF", "PDF"),
        ("LINK", "Link"),
        ("NOTE", "Note"),
    ]

    subitem = models.ForeignKey(SubItem, on_delete=models.CASCADE, related_name="files")

    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='resources/files/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title   

class Question(models.Model):
    subitem = models.ForeignKey(
        SubItem,
        on_delete=models.CASCADE,
        related_name="questions",
        blank=True,
        null=True,
    )
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE,
        related_name="questions",
        blank=True,
        null=True,
    )
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question_text[:50]
    
class Calculator(models.Model):
    TYPE_CHOICES = [
        ("STRUCTURAL", "Structural"),
        ("MATERIAL", "Material"),
        ("COST", "Cost Estimation"),
        ("GENERAL", "General"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)

    def __str__(self):
        return self.title    
    
class CalculatorInput(models.Model):
    calculator = models.ForeignKey(Calculator, on_delete=models.CASCADE, related_name="inputs")

    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=50, blank=True, null=True)
    default_value = models.FloatField(default=0)

class Converter(models.Model):
    TYPE_CHOICES = [
        ("LENGTH", "Length"),
        ("AREA", "Area"),
        ("VOLUME", "Volume"),
    ]

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)

    def __str__(self):
        return self.title        
    
class ConversionUnit(models.Model):
    converter = models.ForeignKey(Converter, on_delete=models.CASCADE, related_name="units")

    name = models.CharField(max_length=50)   # meter, feet, km
    factor = models.FloatField()             # conversion factor to base unit    

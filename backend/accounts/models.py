from django.contrib.auth.models import AbstractUser
from django.db import models
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
    description = RichTextField()
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=50)
    region = models.CharField(choices=REGION_CHOICES, max_length=50)
    pdf_file = models.FileField(upload_to='resources/pdfs/', null=True, blank=True)
    sub_items_count = models.IntegerField(default=0)
    updated_at = models.DateField(auto_now=True)
    link = models.URLField(blank=True, null=True)   

class SubItem(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="subitems")

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title
    
class File(models.Model):
    TYPE_CHOICES = [
        ("PDF", "PDF"),
        ("LINK", "Link"),
        ("NOTE", "Note"),
    ]

    subitem = models.ForeignKey(SubItem, on_delete=models.CASCADE, related_name="files")

    title = models.CharField(max_length=200)
    url = models.URLField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    def __str__(self):
        return self.title   
    
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
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Resource, SubItem, File, Question

# Get the resource and subitem
resource = Resource.objects.get(slug='pokhara-university-entrance-msc-structure-2025')
subitem = resource.subitems.first()

# Add sample PDF files
File.objects.create(
    subitem=subitem,
    title='MSc Entrance Exam 2025 - Full Syllabus',
    url='https://civilcalculation.com/media/resources/pdfs/pokhara-msc-full-syllabus.pdf',
    type='PDF'
)

File.objects.create(
    subitem=subitem,
    title='Previous Years Question Papers',
    url='https://civilcalculation.com/media/resources/pdfs/pokhara-previous-questions.pdf',
    type='PDF'
)

# Add sample study notes
File.objects.create(
    subitem=subitem,
    title='Advanced Calculus Notes',
    url='https://civilcalculation.com/study/advanced-calculus',
    type='NOTE'
)

# Add sample questions
Question.objects.create(
    subitem=subitem,
    question_text='The derivative of sin(x) with respect to x is:',
    option_a='sin(x)',
    option_b='cos(x)',
    option_c='-sin(x)',
    option_d='-cos(x)',
    correct_answer='B'
)

Question.objects.create(
    subitem=subitem,
    question_text='What is the cross product of two parallel vectors?',
    option_a='Zero vector',
    option_b='Unit vector',
    option_c='Scalar quantity',
    option_d='Cannot be determined',
    correct_answer='A'
)

print('✓ Sample data added successfully')

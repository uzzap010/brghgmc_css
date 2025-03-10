from django.db import models
from django.utils import timezone

class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    age = models.IntegerField()
    enrollment_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class Respondent(models.Model):
    age = models.IntegerField()
    date_submitted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Respondent {self.id} - Age {self.age}"

class PersonalInformation(models.Model):
    SURVEY_CHOICES = [
        ('pasyente', 'Pasyente'),
        ('kasama', 'Kasama ng Pasyente'),
        ('negosyo', 'Transaksyon sa Negosyo'),
        ('empleyado', 'Empleyado'),
    ]
    GENDER_CHOICES = [
        ('babae', 'Babae'),
        ('lalaki', 'Lalaki'),
    ]
    RELIGION_CHOICES = [
        ('kristiyano', 'Kristiyano'),
        ('islam', 'Islam'),
        ('wala', 'Wala'),
        ('katoliko', 'Katoliko Romano'),
        ('ibang_relihiyon', 'Ibang Relihiyon'),
    ]
    EDUCATION_CHOICES = [
        ('elementary', 'Elementary'),
        ('secondary', 'Sekondarya'),
        ('vocational', 'Bokasyonal'),
        ('college', 'Kolehiyo'),
        ('postgrad', 'Postgraduates'),
        ('no_formal_edu', 'Walang pormal na edukasyon'),
    ]
    VISIT_FREQUENCY_CHOICES = [
        ('once', '0-1 beses sa isang taon'),
        ('four', '4-6 beses sa isang taon'),
        ('seven', '7-11 beses sa isang taon'),
        ('twelve', '12+ beses sa isang taon'),
    ]

    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='personal_info')
    survey_answer = models.CharField(max_length=20, choices=SURVEY_CHOICES)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    religion = models.CharField(max_length=20, choices=RELIGION_CHOICES)
    education = models.CharField(max_length=20, choices=EDUCATION_CHOICES)
    visit_frequency = models.CharField(max_length=10, choices=VISIT_FREQUENCY_CHOICES)

    def __str__(self):
        return f"Personal Info - {self.respondent}"

class CitizensCharter(models.Model):
    CHARTER_CHOICES = [
        ('seen', 'Alam at nakita ang CC'),
        ('heard_not_seen', 'Alam ngunit hindi nakita ang CC'),
        ('heard_not_seen_2', 'Nalaman lang ang CC nang makita'),
        ('not_aware', 'Hindi alam ang CC'),
    ]
    AWARENESS_CHOICES = [
        ('ibang_tanggapan', 'Ibang tanggapan'),
        ('medyo_madaling_makita', 'Medyo madaling makita'),
        ('mahirap_makita', 'Mahirap makita'),
        ('hindi_makita', 'Hindi makita'),
        ('hindi_naangkop', 'Hindi Naangkop'),
    ]

    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='charter_info')
    charter_awareness = models.CharField(max_length=20, choices=CHARTER_CHOICES)
    visibility_rating = models.CharField(max_length=25, choices=AWARENESS_CHOICES, null=True, blank=True)
    helpfulness_rating = models.CharField(max_length=25, choices=AWARENESS_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"Charter Info - {self.respondent}"

class InfrastructureRating(models.Model):
    RATING_CHOICES = [
        (5, 'Lubos na Sumasang-ayon'),
        (4, 'Sumasang-ayon'),
        (3, 'Medyo Sumasang-ayon'),
        (2, 'Hindi Sumasang-ayon'),
        (1, 'Lubos na Hindi Sumasang-ayon'),
    ]

    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='infrastructure_rating')
    
    # A. Imprastraktura at Proseso
    waiting_area_comfort = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Comfort of waiting area
    bathroom_cleanliness = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Bathroom cleanliness
    patient_room_comfort = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Patient room comfort
    transaction_ease = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Transaction steps ease
    process_compliance = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Process compliance
    information_accessibility = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Information accessibility
    transaction_time = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Transaction time reasonableness

    def __str__(self):
        return f"Infrastructure Rating - {self.respondent}"

class PatientInteractionRating(models.Model):
    RATING_CHOICES = [
        (5, 'Lubos na Sumasang-ayon'),
        (4, 'Sumasang-ayon'),
        (3, 'Medyo Sumasang-ayon'),
        (2, 'Hindi Sumasang-ayon'),
        (1, 'Lubos na Hindi Sumasang-ayon'),
    ]

    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='patient_interaction_rating')
    
    # B. Pakikipag-ugnayan sa mga pasyente
    condition_explanation = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Medical condition explanation
    cultural_consideration = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Cultural views consideration
    treatment_choice = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Treatment choice
    service_delivery = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Service delivery
    payment_fairness = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Payment fairness

    def __str__(self):
        return f"Patient Interaction Rating - {self.respondent}"

class StaffRating(models.Model):
    RATING_CHOICES = [
        (5, 'Lubos na Sumasang-ayon'),
        (4, 'Sumasang-ayon'),
        (3, 'Medyo Sumasang-ayon'),
        (2, 'Hindi Sumasang-ayon'),
        (1, 'Lubos na Hindi Sumasang-ayon'),
    ]

    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='staff_rating')
    doctor_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    nurse_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    midwife_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    security_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    radiology_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    pharmacy_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    lab_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    admitting_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    records_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    billing_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    cashier_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    social_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    food_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)
    janitor_rating = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)

    def __str__(self):
        return f"Staff Rating - {self.respondent}"

class OverallFeedback(models.Model):
    RATING_CHOICES = [
        (5, 'Lubos na Sumasang-ayon'),
        (4, 'Sumasang-ayon'),
        (3, 'Medyo Sumasang-ayon'),
        (2, 'Hindi Sumasang-ayon'),
        (1, 'Lubos na Hindi Sumasang-ayon'),
    ]

    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='overall_feedback')
    equal_treatment = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Rating 14
    satisfaction = models.IntegerField(choices=RATING_CHOICES, null=True, blank=True)  # Rating 15

    def __str__(self):
        return f"Overall Feedback - {self.respondent}"

class FeedbackClassification(models.Model):
    respondent = models.OneToOneField(Respondent, on_delete=models.CASCADE, related_name='feedback_classification')
    suggestions = models.TextField(blank=True, null=True)
    concerns = models.TextField(blank=True, null=True)
    
    # Timeliness
    timeliness_positive = models.BooleanField(default=False)
    timeliness_negative = models.BooleanField(default=False)
    timeliness_suggestion = models.BooleanField(default=False)
    
    # Manpower
    manpower_positive = models.BooleanField(default=False)
    manpower_negative = models.BooleanField(default=False)
    manpower_suggestion = models.BooleanField(default=False)
    
    # Attitude
    attitude_positive = models.BooleanField(default=False)
    attitude_negative = models.BooleanField(default=False)
    attitude_suggestion = models.BooleanField(default=False)
    
    # Queueing
    queueing_positive = models.BooleanField(default=False)
    queueing_negative = models.BooleanField(default=False)
    queueing_suggestion = models.BooleanField(default=False)
    
    # Process
    process_positive = models.BooleanField(default=False)
    process_negative = models.BooleanField(default=False)
    process_suggestion = models.BooleanField(default=False)
    
    # Communication
    communication_positive = models.BooleanField(default=False)
    communication_negative = models.BooleanField(default=False)
    communication_suggestion = models.BooleanField(default=False)
    
    # Cleanliness
    cleanliness_positive = models.BooleanField(default=False)
    cleanliness_negative = models.BooleanField(default=False)
    cleanliness_suggestion = models.BooleanField(default=False)
    
    # Facilities
    facilities_positive = models.BooleanField(default=False)
    facilities_negative = models.BooleanField(default=False)
    facilities_suggestion = models.BooleanField(default=False)
    
    # Environment
    environment_positive = models.BooleanField(default=False)
    environment_negative = models.BooleanField(default=False)
    environment_suggestion = models.BooleanField(default=False)
    
    # Others
    others_positive = models.BooleanField(default=False)
    others_negative = models.BooleanField(default=False)
    others_suggestion = models.BooleanField(default=False)

    def __str__(self):
        return f"Feedback Classification - {self.respondent}"

class ServiceExcellenceFeedback(models.Model):
    # Basic Information
    office_section = models.CharField(max_length=100)
    purpose = models.CharField(max_length=200)
    survey_date = models.DateField()
    staff_first_name = models.CharField(max_length=100)
    staff_last_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Overall Rating
    overall_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    
    # Service Provider Ratings
    timeframe_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    prompt_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    polite_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    sensitive_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    dressed_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    facility_rating = models.IntegerField(choices=[
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5'),
        (6, '6'),
        (7, '7'),
        (0, 'N/A')
    ])
    
    # Quality Rating
    quality_rating = models.IntegerField(choices=[
        (1, 'Poor'),
        (2, 'Fair'),
        (3, 'Good'),
        (4, 'Excellent')
    ])
    
    # Comments
    comments = models.TextField(blank=True, null=True)
    
    # Respondent Details
    respondent_first_name = models.CharField(max_length=100, blank=True, null=True)
    respondent_last_name = models.CharField(max_length=100, blank=True, null=True)
    client_type = models.CharField(max_length=20, choices=[
        ('internal', 'Internal Client'),
        ('external', 'External Client')
    ], blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Feedback from {self.office_section} - {self.created_at.strftime('%Y-%m-%d')}"

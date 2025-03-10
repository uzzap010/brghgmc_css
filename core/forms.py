from django import forms
from .models import (
    Respondent,
    PersonalInformation,
    CitizensCharter,
    StaffRating,
    OverallFeedback,
    FeedbackClassification,
    ServiceExcellenceFeedback,
    InfrastructureRating,
    PatientInteractionRating
)

class RespondentForm(forms.ModelForm):
    class Meta:
        model = Respondent
        fields = ['age']

class PersonalInformationForm(forms.ModelForm):
    class Meta:
        model = PersonalInformation
        fields = ['survey_answer', 'gender', 'religion', 'education', 'visit_frequency']

class CitizensCharterForm(forms.ModelForm):
    class Meta:
        model = CitizensCharter
        fields = ['charter_awareness', 'visibility_rating', 'helpfulness_rating']

class InfrastructureRatingForm(forms.ModelForm):
    class Meta:
        model = InfrastructureRating
        fields = [
            'waiting_area_comfort',
            'bathroom_cleanliness',
            'patient_room_comfort',
            'transaction_ease',
            'process_compliance',
            'information_accessibility',
            'transaction_time',
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional
        for field in self.fields:
            self.fields[field].required = False

class PatientInteractionRatingForm(forms.ModelForm):
    class Meta:
        model = PatientInteractionRating
        fields = [
            'condition_explanation',
            'cultural_consideration',
            'treatment_choice',
            'service_delivery',
            'payment_fairness',
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional
        for field in self.fields:
            self.fields[field].required = False

class StaffRatingForm(forms.ModelForm):
    class Meta:
        model = StaffRating
        fields = [
            'doctor_rating',
            'nurse_rating',
            'midwife_rating',
            'security_rating',
            'radiology_rating',
            'pharmacy_rating',
            'lab_rating',
            'admitting_rating',
            'records_rating',
            'billing_rating',
            'cashier_rating',
            'social_rating',
            'food_rating',
            'janitor_rating'
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional
        for field in self.fields:
            self.fields[field].required = False

class OverallFeedbackForm(forms.ModelForm):
    class Meta:
        model = OverallFeedback
        fields = ['equal_treatment', 'satisfaction']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make all fields optional
        self.fields['equal_treatment'].required = False
        self.fields['satisfaction'].required = False

class FeedbackClassificationForm(forms.ModelForm):
    class Meta:
        model = FeedbackClassification
        fields = [
            'suggestions',
            'concerns',
            'timeliness_positive',
            'timeliness_negative',
            'timeliness_suggestion',
            'manpower_positive',
            'manpower_negative',
            'manpower_suggestion',
            'attitude_positive',
            'attitude_negative',
            'attitude_suggestion',
            'queueing_positive',
            'queueing_negative',
            'queueing_suggestion',
            'process_positive',
            'process_negative',
            'process_suggestion',
            'communication_positive',
            'communication_negative',
            'communication_suggestion',
            'cleanliness_positive',
            'cleanliness_negative',
            'cleanliness_suggestion',
            'facilities_positive',
            'facilities_negative',
            'facilities_suggestion',
            'environment_positive',
            'environment_negative',
            'environment_suggestion',
            'others_positive',
            'others_negative',
            'others_suggestion'
        ]

class ServiceExcellenceFeedbackForm(forms.ModelForm):
    class Meta:
        model = ServiceExcellenceFeedback
        fields = [
            'office_section', 'purpose', 'survey_date', 'staff_first_name', 'staff_last_name',
            'overall_rating', 'timeframe_rating', 'prompt_rating', 'polite_rating',
            'sensitive_rating', 'dressed_rating', 'facility_rating', 'quality_rating',
            'comments', 'respondent_first_name', 'respondent_last_name', 'client_type',
            'gender', 'address', 'contact_number'
        ]
        widgets = {
            'survey_date': forms.DateInput(attrs={'type': 'date'}),
            'comments': forms.Textarea(attrs={'rows': 5}),
            'address': forms.Textarea(attrs={'rows': 2}),
        }

from django.contrib import admin
from django import forms
from .models import (
    Respondent,
    PersonalInformation,
    CitizensCharter,
    InfrastructureRating,
    PatientInteractionRating,
    StaffRating,
    OverallFeedback,
    FeedbackClassification,
    ServiceExcellenceFeedback,
    AdminAccount
)

class AdminAccountAdminForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, required=False)
    confirm_password = forms.CharField(widget=forms.PasswordInput, required=False)

    class Meta:
        model = AdminAccount
        fields = ('username', 'email', 'full_name', 'is_active', 'password')

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match")
        return cleaned_data

@admin.register(AdminAccount)
class AdminAccountAdmin(admin.ModelAdmin):
    form = AdminAccountAdminForm
    list_display = ('username', 'email', 'full_name', 'is_active', 'last_login')
    list_filter = ('is_active', 'created_at')
    search_fields = ('username', 'email', 'full_name')
    readonly_fields = ('created_at', 'last_login')
    ordering = ('-created_at',)
    
    def save_model(self, request, obj, form, change):
        if form.cleaned_data.get('password'):
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)

@admin.register(Respondent)
class RespondentAdmin(admin.ModelAdmin):
    list_display = ('id', 'age', 'date_submitted')
    list_filter = ('date_submitted',)

@admin.register(PersonalInformation)
class PersonalInformationAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'survey_answer', 'gender', 'religion', 'education', 'visit_frequency')
    list_filter = ('gender', 'religion', 'education', 'visit_frequency')

@admin.register(CitizensCharter)
class CitizensCharterAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'charter_awareness', 'visibility_rating', 'helpfulness_rating')
    list_filter = ('charter_awareness', 'visibility_rating', 'helpfulness_rating')

@admin.register(InfrastructureRating)
class InfrastructureRatingAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'waiting_area_comfort', 'bathroom_cleanliness', 'patient_room_comfort',
                   'transaction_ease', 'process_compliance', 'information_accessibility', 'transaction_time')
    list_filter = ('waiting_area_comfort', 'bathroom_cleanliness', 'patient_room_comfort')

@admin.register(PatientInteractionRating)
class PatientInteractionRatingAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'condition_explanation', 'cultural_consideration', 'treatment_choice',
                   'service_delivery', 'payment_fairness')
    list_filter = ('condition_explanation', 'cultural_consideration', 'treatment_choice')

@admin.register(StaffRating)
class StaffRatingAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'doctor_rating', 'nurse_rating', 'midwife_rating')
    list_filter = ('doctor_rating', 'nurse_rating', 'midwife_rating')

@admin.register(OverallFeedback)
class OverallFeedbackAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'equal_treatment', 'satisfaction')
    list_filter = ('equal_treatment', 'satisfaction')

@admin.register(FeedbackClassification)
class FeedbackClassificationAdmin(admin.ModelAdmin):
    list_display = ('respondent', 'has_suggestions', 'has_concerns')
    list_filter = ('timeliness_positive', 'timeliness_negative', 'timeliness_suggestion')
    
    def has_suggestions(self, obj):
        return bool(obj.suggestions)
    has_suggestions.boolean = True
    
    def has_concerns(self, obj):
        return bool(obj.concerns)
    has_concerns.boolean = True

@admin.register(ServiceExcellenceFeedback)
class ServiceExcellenceFeedbackAdmin(admin.ModelAdmin):
    list_display = ('office_section', 'purpose', 'survey_date', 'staff_first_name', 'staff_last_name', 'created_at')
    list_filter = ('office_section', 'survey_date', 'created_at')
    search_fields = ('office_section', 'purpose', 'staff_first_name', 'staff_last_name', 'comments')
    date_hierarchy = 'survey_date'
    ordering = ('-created_at',)

from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.views import View
from datetime import date, datetime
from django.utils import timezone
import logging
import traceback
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from .models import (
    Student,
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
from .forms import (
    RespondentForm,
    PersonalInformationForm,
    CitizensCharterForm,
    InfrastructureRatingForm,
    PatientInteractionRatingForm,
    StaffRatingForm,
    OverallFeedbackForm,
    FeedbackClassificationForm,
    ServiceExcellenceFeedbackForm
)
import json
from django.contrib.auth.decorators import login_required
from django.conf import settings

# Configure logging
logger = logging.getLogger(__name__)

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get('admin_id'):
            return redirect('core_admin:admin_login')
        return view_func(request, *args, **kwargs)
    return wrapper

class AdminLoginView(View):
    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        if request.session.get('admin_id'):
            return redirect('core_admin:admin_dashboard')
        return render(request, 'admin/login.html')

    @method_decorator(csrf_exempt)
    def post(self, request):
        try:
            # Parse the request body
            try:
                if request.content_type == 'application/json':
                    data = json.loads(request.body)
                else:
                    data = request.POST
            except json.JSONDecodeError:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Invalid JSON format in request'
                }, status=400)
            
            username = data.get('username')
            password = data.get('password')
            remember = data.get('remember', False)

            if not username or not password:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Username and password are required'
                }, status=400)

            try:
                admin = AdminAccount.objects.get(username=username)
                
                if not admin.is_active:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'This account is inactive'
                    }, status=401)

                if admin.check_password(password):
                    request.session.flush()
                    admin.last_login = timezone.now()
                    admin.save()

                    request.session['admin_id'] = admin.id
                    request.session['admin_username'] = admin.username
                    
                    if remember:
                        request.session.set_expiry(86400)
                    else:
                        request.session.set_expiry(0)
                    
                    request.session.save()

                    return JsonResponse({
                        'status': 'success',
                        'redirect_url': '/custom-admin/dashboard/'
                    })
                else:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Invalid password'
                    }, status=401)

            except AdminAccount.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Admin account not found'
                }, status=401)

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred'
            }, status=500)

# Convert function-based view to class-based view
admin_login = AdminLoginView.as_view()

@admin_required
def admin_dashboard(request):
    try:
        admin_id = request.session.get('admin_id')
        if not admin_id:
            logger.warning("No admin_id in session")
            request.session.flush()  # Clear invalid session
            return redirect('core_admin:admin_login')

        try:
            admin = AdminAccount.objects.get(id=admin_id)
        except AdminAccount.DoesNotExist:
            logger.warning(f"AdminAccount with id {admin_id} not found")
            request.session.flush()  # Clear invalid session
            messages.error(request, 'Your session has expired. Please login again.')
            return redirect('core_admin:admin_login')

        context = {
            'admin': admin,
            'total_users': AdminAccount.objects.count(),
            'total_feedback': ServiceExcellenceFeedback.objects.count(),
        }
        
        return render(request, 'admin/dashboard.html', context)
    except Exception as e:
        logger.error(f"Error in admin_dashboard: {str(e)}")
        messages.error(request, 'An error occurred. Please try again.')
        return redirect('core_admin:admin_login')

def admin_logout(request):
    request.session.flush()
    return redirect('core_admin:admin_login')

# Homepage View
def home(request):
    students = Student.objects.all()  # If needed
    return render(request, 'users/index.html')

# Office Index View
def office_index(request):
    return render(request, 'users/office_index.html')

# Office Feedback Form View
def feedback_form2(request):
    if request.method == 'POST':
        print("\n=== DEBUG INFO ===")
        print("POST request received")
        
        # Set the survey date to today's date
        post_data = request.POST.copy()  # Make a mutable copy of the POST data
        post_data['survey_date'] = date.today().strftime('%Y-%m-%d')
        
        form = ServiceExcellenceFeedbackForm(post_data)
        print("\nForm Fields and their values:")
        for field in form.fields:
            print(f"{field}: {post_data.get(field, 'Not provided')}")
        
        if form.is_valid():
            print("\nForm is valid")
            print("Cleaned data:", form.cleaned_data)
            
            try:
                feedback = form.save(commit=False)
                feedback.survey_date = date.today()  # Ensure the date is set
                feedback.save()
                print(f"\nFeedback saved successfully with ID: {feedback.id}")
                messages.success(request, 'Thank you for your feedback!')
                return JsonResponse({'status': 'success'})
            except Exception as e:
                print("\nError occurred while saving:")
                print(f"Error type: {type(e).__name__}")
                print(f"Error message: {str(e)}")
                print("Full traceback:")
                print(traceback.format_exc())
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        else:
            print("\nForm is invalid")
            print("Form errors:", form.errors)
            return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
    else:
        form = ServiceExcellenceFeedbackForm()
    
    return render(request, 'users/feedback_form2.html', {'form': form})

# Feedback Form View (Handles GET & POST)
def feedback_form1(request):
    if request.method == 'POST':
        # Create form instances with POST data
        respondent_form = RespondentForm(request.POST)
        personal_info_form = PersonalInformationForm(request.POST)
        charter_form = CitizensCharterForm(request.POST)
        infrastructure_form = InfrastructureRatingForm(request.POST)
        patient_interaction_form = PatientInteractionRatingForm(request.POST)
        staff_rating_form = StaffRatingForm(request.POST)
        overall_feedback_form = OverallFeedbackForm(request.POST)
        feedback_classification_form = FeedbackClassificationForm(request.POST)

        # Debug print statements
        print("POST Data:", request.POST)

        # Check individual form validity and print errors
        forms_validity = {
            'respondent_form': respondent_form.is_valid(),
            'personal_info_form': personal_info_form.is_valid(),
            'charter_form': charter_form.is_valid(),
            'infrastructure_form': infrastructure_form.is_valid(),
            'patient_interaction_form': patient_interaction_form.is_valid(),
            'staff_rating_form': staff_rating_form.is_valid(),
            'overall_feedback_form': overall_feedback_form.is_valid(),
            'feedback_classification_form': feedback_classification_form.is_valid()
        }

        print("Forms Validity:", forms_validity)

        # Print form errors if any
        if not all(forms_validity.values()):
            print("Form Errors:")
            if not respondent_form.is_valid():
                print("Respondent Form Errors:", respondent_form.errors)
            if not personal_info_form.is_valid():
                print("Personal Info Form Errors:", personal_info_form.errors)
            if not charter_form.is_valid():
                print("Charter Form Errors:", charter_form.errors)
            if not infrastructure_form.is_valid():
                print("Infrastructure Form Errors:", infrastructure_form.errors)
            if not patient_interaction_form.is_valid():
                print("Patient Interaction Form Errors:", patient_interaction_form.errors)
            if not staff_rating_form.is_valid():
                print("Staff Rating Form Errors:", staff_rating_form.errors)
            if not overall_feedback_form.is_valid():
                print("Overall Feedback Form Errors:", overall_feedback_form.errors)
            if not feedback_classification_form.is_valid():
                print("Feedback Classification Form Errors:", feedback_classification_form.errors)

        # Check if all forms are valid
        if all(forms_validity.values()):
            try:
                # Save respondent first to get the ID
                respondent = respondent_form.save()
                print("Respondent saved successfully:", respondent.id)

                try:
                    # Save all related forms with the respondent
                    personal_info = personal_info_form.save(commit=False)
                    personal_info.respondent = respondent
                    personal_info.save()
                    print("Personal info saved successfully")

                    charter = charter_form.save(commit=False)
                    charter.respondent = respondent
                    charter.save()
                    print("Charter info saved successfully")

                    infrastructure = infrastructure_form.save(commit=False)
                    infrastructure.respondent = respondent
                    infrastructure.save()
                    print("Infrastructure rating saved successfully")

                    patient_interaction = patient_interaction_form.save(commit=False)
                    patient_interaction.respondent = respondent
                    patient_interaction.save()
                    print("Patient interaction rating saved successfully")

                    staff_rating = staff_rating_form.save(commit=False)
                    staff_rating.respondent = respondent
                    staff_rating.save()
                    print("Staff rating saved successfully")

                    overall_feedback = overall_feedback_form.save(commit=False)
                    overall_feedback.respondent = respondent
                    overall_feedback.save()
                    print("Overall feedback saved successfully")

                    feedback_classification = feedback_classification_form.save(commit=False)
                    feedback_classification.respondent = respondent
                    feedback_classification.save()
                    print("Feedback classification saved successfully")

                    messages.success(request, 'Thank you for your feedback!')
                    return redirect('core:feedback_success')

                except Exception as inner_e:
                    print(f"Error saving related data: {str(inner_e)}")
                    # If there's an error saving related data, delete the respondent
                    respondent.delete()
                    messages.error(request, f'An error occurred while saving your feedback: {str(inner_e)}')

            except Exception as e:
                print(f"Error saving respondent: {str(e)}")
                messages.error(request, f'An error occurred while saving your feedback: {str(e)}')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        # Create empty form instances for GET request
        respondent_form = RespondentForm()
        personal_info_form = PersonalInformationForm()
        charter_form = CitizensCharterForm()
        infrastructure_form = InfrastructureRatingForm()
        patient_interaction_form = PatientInteractionRatingForm()
        staff_rating_form = StaffRatingForm()
        overall_feedback_form = OverallFeedbackForm()
        feedback_classification_form = FeedbackClassificationForm()

    context = {
        'respondent_form': respondent_form,
        'personal_info_form': personal_info_form,
        'charter_form': charter_form,
        'infrastructure_form': infrastructure_form,
        'patient_interaction_form': patient_interaction_form,
        'staff_rating_form': staff_rating_form,
        'overall_feedback_form': overall_feedback_form,
        'feedback_classification_form': feedback_classification_form,
    }

    return render(request, 'users/feedback_form1.html', context)

def feedback_success(request):
    """
    View to display the feedback submission success page.
    """
    return render(request, 'users/feedback_success.html')

# Success Page View
def success_view(request):
    return render(request, 'users/success.html')

# Feedback Form Page View
def feedback_form1_view(request):
    return render(request, 'users/feedback_form1.html')

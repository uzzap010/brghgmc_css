from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.views import View
from datetime import date, datetime, timedelta
from django.utils import timezone
import logging
import traceback
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import (
    Feedback,
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
from django.utils.timesince import timesince
import csv
from django.http import HttpResponse
import openpyxl
from openpyxl.styles import Font, Alignment
import xlsxwriter

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
            request.session.flush()
            return redirect('core_admin:admin_login')

        try:
            admin = AdminAccount.objects.get(id=admin_id)
        except AdminAccount.DoesNotExist:
            logger.warning(f"AdminAccount with id {admin_id} not found")
            request.session.flush()
            messages.error(request, 'Your session has expired. Please login again.')
            return redirect('core_admin:admin_login')

        # Get selected month from query parameters or use current month
        selected_date = request.GET.get('month', None)
        if selected_date:
            try:
                selected_date = datetime.strptime(selected_date, '%Y-%m')
                month_start = selected_date.replace(day=1)
                month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            except ValueError:
                selected_date = timezone.now()
                month_start = selected_date.replace(day=1)
                month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        else:
            selected_date = timezone.now()
            month_start = selected_date.replace(day=1)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

        # Get available months from database
        available_months = PersonalInformation.objects.dates('respondent__date_submitted', 'month', order='DESC')

        # Get counts for selected month
        patient_count = PersonalInformation.objects.filter(
            survey_answer='pasyente',
            respondent__date_submitted__range=[month_start, month_end]
        ).count()
        relatives_count = PersonalInformation.objects.filter(
            survey_answer='kasama',
            respondent__date_submitted__range=[month_start, month_end]
        ).count()
        business_count = PersonalInformation.objects.filter(
            survey_answer='negosyo',
            respondent__date_submitted__range=[month_start, month_end]
        ).count()
        employee_count = PersonalInformation.objects.filter(
            survey_answer='empleyado',
            respondent__date_submitted__range=[month_start, month_end]
        ).count()

        # Get new feedback from the last 24 hours
        last_24_hours = timezone.now() - timedelta(days=1)
        new_feedback = ServiceExcellenceFeedback.objects.filter(
            created_at__gte=last_24_hours
        ).order_by('-created_at')[:5]
        new_feedback_count = new_feedback.count()

        # Get charter choice statistics for selected month
        charter_stats = {
            'Aware and Seen': CitizensCharter.objects.filter(
                charter_awareness='seen',
                respondent__date_submitted__range=[month_start, month_end]
            ).count(),
            'Aware but Not Seen': CitizensCharter.objects.filter(
                charter_awareness='heard_not_seen',
                respondent__date_submitted__range=[month_start, month_end]
            ).count(),
            'Learned Upon Seeing': CitizensCharter.objects.filter(
                charter_awareness='heard_not_seen_2',
                respondent__date_submitted__range=[month_start, month_end]
            ).count(),
            'Not Aware': CitizensCharter.objects.filter(
                charter_awareness='not_aware',
                respondent__date_submitted__range=[month_start, month_end]
            ).count(),
        }

        # Get monthly data for the last 6 months from selected month
        monthly_data = []
        for i in range(5, -1, -1):
            current_month = month_start - timedelta(days=30*i)
            current_month_start = current_month.replace(day=1)
            current_month_end = (current_month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            month_data = {
                'month': current_month_start.strftime('%B %Y'),
                'patient': PersonalInformation.objects.filter(
                    survey_answer='pasyente',
                    respondent__date_submitted__range=[current_month_start, current_month_end]
                ).count(),
                'relatives': PersonalInformation.objects.filter(
                    survey_answer='kasama',
                    respondent__date_submitted__range=[current_month_start, current_month_end]
                ).count(),
                'business': PersonalInformation.objects.filter(
                    survey_answer='negosyo',
                    respondent__date_submitted__range=[current_month_start, current_month_end]
                ).count(),
                'employee': PersonalInformation.objects.filter(
                    survey_answer='empleyado',
                    respondent__date_submitted__range=[current_month_start, current_month_end]
                ).count()
            }
            monthly_data.append(month_data)

        # Prepare chart data
        chart_data = {
            'charter': {
                'labels': list(charter_stats.keys()),
                'values': list(charter_stats.values())
            },
            'survey': {
                'labels': ['Patient', 'Relatives', 'Business', 'Employee'],
                'values': [patient_count, relatives_count, business_count, employee_count]
            },
            'monthly': {
                'labels': [data['month'] for data in monthly_data],
                'datasets': [
                    {
                        'label': 'Patient',
                        'data': [data['patient'] for data in monthly_data]
                    },
                    {
                        'label': 'Relatives',
                        'data': [data['relatives'] for data in monthly_data]
                    },
                    {
                        'label': 'Business',
                        'data': [data['business'] for data in monthly_data]
                    },
                    {
                        'label': 'Employee',
                        'data': [data['employee'] for data in monthly_data]
                    }
                ]
            }
        }

        # Get recent survey responses from the last 24 hours
        last_24_hours = timezone.now() - timedelta(days=1)
        recent_surveys = PersonalInformation.objects.filter(
            respondent__date_submitted__gte=last_24_hours
        ).select_related('respondent').order_by('-respondent__date_submitted')[:5]

        context = {
            'admin': admin,
            'total_users': AdminAccount.objects.count(),
            'total_feedback': ServiceExcellenceFeedback.objects.count(),
            'survey_counts': {
                'patient': patient_count,
                'relatives': relatives_count,
                'business': business_count,
                'employee': employee_count
            },
            'charter_stats': charter_stats,
            'chart_data_json': json.dumps(chart_data),
            'recent_surveys': recent_surveys,
            'available_months': available_months,
            'selected_month': selected_date.strftime('%B %Y'),
            'selected_month_value': selected_date.strftime('%Y-%m'),
            'new_feedback': new_feedback,
            'new_feedback_count': new_feedback_count
        }
        
        return render(request, 'admin/dashboard.html', context)
    except Exception as e:
        logger.error(f"Error in admin_dashboard: {str(e)}")
        messages.error(request, 'An error occurred. Please try again.')
        return redirect('core_admin:admin_login')

def admin_logout(request):
    request.session.flush()
    return redirect('core_admin:admin_login')

@admin_required
def get_dashboard_updates(request):
    try:
        # Get new feedback from the last 24 hours
        last_24_hours = timezone.now() - timedelta(days=1)
        new_feedback = ServiceExcellenceFeedback.objects.filter(
            created_at__gte=last_24_hours
        ).order_by('-created_at')[:5]
        new_feedback_count = new_feedback.count()

        # Get recent survey responses
        recent_surveys = PersonalInformation.objects.filter(
            respondent__date_submitted__gte=last_24_hours
        ).select_related('respondent').order_by('-respondent__date_submitted')[:5]

        # Prepare feedback data
        feedback_data = []
        for feedback in new_feedback:
            feedback_data.append({
                'time': feedback.created_at.isoformat(),
                'timesince': timesince(feedback.created_at),
                'office': feedback.office_section,
                'rating': feedback.overall_rating
            })

        # Prepare survey data
        survey_data = []
        for survey in recent_surveys:
            survey_data.append({
                'type': survey.survey_answer,
                'time': survey.respondent.date_submitted.isoformat(),
                'timesince': timesince(survey.respondent.date_submitted)
            })

        return JsonResponse({
            'status': 'success',
            'new_feedback_count': new_feedback_count,
            'feedback_data': feedback_data,
            'survey_data': survey_data
        })
    except Exception as e:
        logger.error(f"Error in get_dashboard_updates: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

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

@admin_required
def admin_feedback(request):
    try:
        admin_id = request.session.get('admin_id')
        if not admin_id:
            logger.warning("No admin_id in session")
            request.session.flush()
            return redirect('core:admin_login')

        try:
            admin = AdminAccount.objects.get(id=admin_id)
        except AdminAccount.DoesNotExist:
            logger.warning(f"AdminAccount with id {admin_id} not found")
            request.session.flush()
            messages.error(request, 'Your session has expired. Please login again.')
            return redirect('core:admin_login')

        # Get selected month from query parameters or use current month
        selected_date = request.GET.get('month', None)
        if selected_date:
            try:
                selected_date = datetime.strptime(selected_date, '%Y-%m')
                month_start = selected_date.replace(day=1)
                month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            except ValueError:
                selected_date = timezone.now()
                month_start = selected_date.replace(day=1)
                month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        else:
            selected_date = timezone.now()
            month_start = selected_date.replace(day=1)
            month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)

        # Get available months from database
        available_months = PersonalInformation.objects.dates('respondent__date_submitted', 'month', order='DESC')

        # Get feedback for selected month
        feedbacks = PersonalInformation.objects.filter(
            respondent__date_submitted__range=[month_start, month_end]
        ).select_related('respondent').order_by('-respondent__date_submitted')

        # Pagination
        page = request.GET.get('page', 1)
        paginator = Paginator(feedbacks, 10)  # Show 10 feedbacks per page
        try:
            feedbacks = paginator.page(page)
        except PageNotAnInteger:
            feedbacks = paginator.page(1)
        except EmptyPage:
            feedbacks = paginator.page(paginator.num_pages)

        # Get new feedback count for notification badge
        last_24_hours = timezone.now() - timedelta(days=1)
        new_feedback = ServiceExcellenceFeedback.objects.filter(
            created_at__gte=last_24_hours
        ).order_by('-created_at')[:5]
        new_feedback_count = new_feedback.count()

        context = {
            'admin': admin,
            'feedbacks': feedbacks,
            'available_months': available_months,
            'selected_month': selected_date.strftime('%B %Y'),
            'selected_month_value': selected_date.strftime('%Y-%m'),
            'new_feedback': new_feedback,
            'new_feedback_count': new_feedback_count
        }
        
        return render(request, 'admin/feedback.html', context)
    except Exception as e:
        logger.error(f"Error in admin_feedback: {str(e)}")
        messages.error(request, 'An error occurred. Please try again.')
        return redirect('core:admin_login')

from django.http import HttpResponse
import xlsxwriter
from datetime import datetime, date

def export_feedback(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    # Create an in-memory output file for the new workbook.
    output = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    output['Content-Disposition'] = f'attachment; filename="feedback_{start_date}_to_{end_date}.xlsx"'

    # Create a workbook and add worksheets.
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    
    # Add formats
    bold = workbook.add_format({'bold': True})
    header_format = workbook.add_format({'bold': True, 'font_size': 20, 'align': 'center'})
    subheader_format = workbook.add_format({'bold': True, 'font_size': 16, 'align': 'center'})
    cell_format = workbook.add_format({'text_wrap': True})

    # Function to write headers and data to a worksheet
    def write_data_to_sheet(worksheet, headers, data, workbook):
        # Define formats
        header_format = workbook.add_format({
            'bold': True, 
            'font_size': 40, 
            'align': 'center', 
            'valign': 'vcenter', 
            'bg_color': '#3D925F', 
            'font_color': 'white'
        })
        subheader_format = workbook.add_format({
            'bold': True, 
            'font_size': 20, 
            'align': 'center', 
            'valign': 'vcenter', 
            'bg_color': '#3D925F', 
            'font_color': 'white'
        })
        header_cell_format = workbook.add_format({
            'bold': True, 
            'bg_color': '#E7AB38', 
            'align': 'center', 
            'valign': 'vcenter'
        })
        cell_format = workbook.add_format({
            'text_wrap': True, 
            'align': 'center', 
            'valign': 'vcenter'
        })
        date_format = workbook.add_format({'num_format': 'yyyy-mm-dd'})

        # Merge cells for the main header and subheader
        worksheet.merge_range('A1:AG1', 'BICOL REGION GENERAL HOSPITAL AND GERIATRIC MEDICAL CENTER', header_format)
        worksheet.merge_range('A2:AG2', 'HOSPITAL CLIENT EXPERIENCE SURVEY', subheader_format)

        # Insert logo
        try:
            worksheet.insert_image('Z1', 'static/images/logo.png', {'x_scale': 0.5, 'y_scale': 0.5})
        except FileNotFoundError:
            print("Logo image not found. Please check the path.")

        # Write the header row
        for col_num, header in enumerate(headers):
            worksheet.write(3, col_num, header, header_cell_format)

        # Write the data rows
        row_num = 4
        for row_data in data:
            for col_num, cell_data in enumerate(row_data):
                if cell_data is None or cell_data == '':
                    worksheet.write(row_num, col_num, '', cell_format)
                elif isinstance(cell_data, (int, float)):
                    worksheet.write(row_num, col_num, cell_data, cell_format)
                elif isinstance(cell_data, date):
                    worksheet.write(row_num, col_num, cell_data, date_format)
                else:
                    worksheet.write(row_num, col_num, str(cell_data), cell_format)
            row_num += 1

        # Adjust column widths for better readability
        for col_num in range(len(headers)):
            worksheet.set_column(col_num, col_num, 20)

    # Respondent data
    respondent_headers = ['Respondent ID', 'Age', 'Date Submitted']
    respondent_data = [
        [respondent.id, respondent.age, respondent.date_submitted.date()]
        for respondent in Respondent.objects.filter(date_submitted__range=[start_date, end_date])
    ]
    respondent_sheet = workbook.add_worksheet('Respondents')
    write_data_to_sheet(respondent_sheet, respondent_headers, respondent_data, workbook)

    # Personal Information data
    personal_info_headers = [
        'Respondent ID', 'Survey Answer', 'Gender', 'Religion', 'Education', 'Visit Frequency'
    ]
    personal_info_data = [
        [
            info.respondent.id, info.get_survey_answer_display(), info.get_gender_display(),
            info.get_religion_display(), info.get_education_display(), info.get_visit_frequency_display()
        ]
        for info in PersonalInformation.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    personal_info_sheet = workbook.add_worksheet('Personal Information')
    write_data_to_sheet(personal_info_sheet, personal_info_headers, personal_info_data, workbook)

    # Citizens Charter data
    citizens_charter_headers = [
        'Respondent ID', 'Charter Awareness', 'Visibility Rating', 'Helpfulness Rating'
    ]
    citizens_charter_data = [
        [
            charter.respondent.id, charter.get_charter_awareness_display(),
            charter.get_visibility_rating_display(), charter.get_helpfulness_rating_display()
        ]
        for charter in CitizensCharter.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    citizens_charter_sheet = workbook.add_worksheet('Citizens Charter')
    write_data_to_sheet(citizens_charter_sheet, citizens_charter_headers, citizens_charter_data, workbook)

    # Infrastructure Rating data
    infrastructure_headers = [
        'Respondent ID', 'Waiting Area Comfort', 'Bathroom Cleanliness', 'Patient Room Comfort',
        'Transaction Ease', 'Process Compliance', 'Information Accessibility', 'Transaction Time'
    ]
    infrastructure_data = [
        [
            rating.respondent.id, rating.waiting_area_comfort, rating.bathroom_cleanliness,
            rating.patient_room_comfort, rating.transaction_ease, rating.process_compliance,
            rating.information_accessibility, rating.transaction_time
        ]
        for rating in InfrastructureRating.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    infrastructure_sheet = workbook.add_worksheet('Infrastructure Rating')
    write_data_to_sheet(infrastructure_sheet, infrastructure_headers, infrastructure_data, workbook)

    # Patient Interaction Rating data
    patient_interaction_headers = [
        'Respondent ID', 'Condition Explanation', 'Cultural Consideration', 'Treatment Choice',
        'Service Delivery', 'Payment Fairness'
    ]
    patient_interaction_data = [
        [
            rating.respondent.id, rating.condition_explanation, rating.cultural_consideration,
            rating.treatment_choice, rating.service_delivery, rating.payment_fairness
        ]
        for rating in PatientInteractionRating.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    patient_interaction_sheet = workbook.add_worksheet('Patient Interaction Rating')
    write_data_to_sheet(patient_interaction_sheet, patient_interaction_headers, patient_interaction_data, workbook)

    # Staff Rating data
    staff_rating_headers = [
        'Respondent ID', 'Doctor Rating', 'Nurse Rating', 'Midwife Rating', 'Security Rating',
        'Radiology Rating', 'Pharmacy Rating', 'Lab Rating', 'Admitting Rating', 'Records Rating',
        'Billing Rating', 'Cashier Rating', 'Social Rating', 'Food Rating', 'Janitor Rating'
    ]
    staff_rating_data = [
        [
            rating.respondent.id, rating.doctor_rating, rating.nurse_rating, rating.midwife_rating,
            rating.security_rating, rating.radiology_rating, rating.pharmacy_rating, rating.lab_rating,
            rating.admitting_rating, rating.records_rating, rating.billing_rating, rating.cashier_rating,
            rating.social_rating, rating.food_rating, rating.janitor_rating
        ]
        for rating in StaffRating.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    staff_rating_sheet = workbook.add_worksheet('Staff Rating')
    write_data_to_sheet(staff_rating_sheet, staff_rating_headers, staff_rating_data, workbook)

    # Overall Feedback data
    overall_feedback_headers = [
        'Respondent ID', 'Equal Treatment', 'Satisfaction'
    ]
    overall_feedback_data = [
        [
            feedback.respondent.id, feedback.equal_treatment, feedback.satisfaction
        ]
        for feedback in OverallFeedback.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    overall_feedback_sheet = workbook.add_worksheet('Overall Feedback')
    write_data_to_sheet(overall_feedback_sheet, overall_feedback_headers, overall_feedback_data, workbook)

    # Feedback Classification data
    feedback_classification_headers = [
        'Respondent ID', 'Suggestions', 'Concerns', 'Timeliness Positive', 'Timeliness Negative', 'Timeliness Suggestion',
        'Manpower Positive', 'Manpower Negative', 'Manpower Suggestion', 'Attitude Positive', 'Attitude Negative',
        'Attitude Suggestion', 'Queueing Positive', 'Queueing Negative', 'Queueing Suggestion', 'Process Positive',
        'Process Negative', 'Process Suggestion', 'Communication Positive', 'Communication Negative',
        'Communication Suggestion', 'Cleanliness Positive', 'Cleanliness Negative', 'Cleanliness Suggestion',
        'Facilities Positive', 'Facilities Negative', 'Facilities Suggestion', 'Environment Positive',
        'Environment Negative', 'Environment Suggestion', 'Others Positive', 'Others Negative', 'Others Suggestion'
    ]
    feedback_classification_data = [
        [
            classification.respondent.id, classification.suggestions, classification.concerns,
            classification.timeliness_positive, classification.timeliness_negative, classification.timeliness_suggestion,
            classification.manpower_positive, classification.manpower_negative, classification.manpower_suggestion,
            classification.attitude_positive, classification.attitude_negative, classification.attitude_suggestion,
            classification.queueing_positive, classification.queueing_negative, classification.queueing_suggestion,
            classification.process_positive, classification.process_negative, classification.process_suggestion,
            classification.communication_positive, classification.communication_negative, classification.communication_suggestion,
            classification.cleanliness_positive, classification.cleanliness_negative, classification.cleanliness_suggestion,
            classification.facilities_positive, classification.facilities_negative, classification.facilities_suggestion,
            classification.environment_positive, classification.environment_negative, classification.environment_suggestion,
            classification.others_positive, classification.others_negative, classification.others_suggestion
        ]
        for classification in FeedbackClassification.objects.filter(respondent__date_submitted__range=[start_date, end_date])
    ]
    feedback_classification_sheet = workbook.add_worksheet('Feedback Classification')
    write_data_to_sheet(feedback_classification_sheet, feedback_classification_headers, feedback_classification_data, workbook)

    # Close the workbook.
    workbook.close()

    return output


def feedback_list(request):
    feedbacks = Feedback.objects.all()
    for feedback in feedbacks:
        feedback.is_new = feedback.is_new()
    return render(request, 'admin/feedback.html', {'feedbacks': feedbacks})


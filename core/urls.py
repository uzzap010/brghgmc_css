from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('office/', views.office_index, name='office_index'),
    path('feedback/', views.feedback_form1, name='feedback_form1'),
    path('office/feedback/', views.feedback_form2, name='feedback_form2'),
    path('feedback/success/', views.feedback_success, name='feedback_success'),
    path('login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('logout/', views.admin_logout, name='admin_logout'),
]

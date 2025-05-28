from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    PropertyViewSet, InquiryViewSet, FavoriteViewSet, NewProjectViewSet,
    login_view, send_verification_code, verify_phone, register_view, verify_email_otp
)

router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'inquiries', InquiryViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'new-projects', NewProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_view, name='register'),
    path('auth/verify-email-otp/', verify_email_otp, name='verify-email-otp'),
    path('auth/login/', login_view, name='login'),
    path('auth/send-verification/', send_verification_code, name='send-verification'),
    path('auth/verify-phone/', verify_phone, name='verify-phone'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

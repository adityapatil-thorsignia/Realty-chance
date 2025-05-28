from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Property, Inquiry, Favorite, NewProject, User
)
from .serializers import (
    PropertySerializer, PropertyCreateUpdateSerializer, InquirySerializer,
    FavoriteSerializer, NewProjectSerializer, NewProjectCreateUpdateSerializer,
    UserSerializer, UserCreateSerializer
)
from .permissions import (
    IsOwner, IsPropertyOwner, IsPropertySeeker, IsAdmin, IsProjectCreator
)
from .filters import PropertyFilter, NewProjectFilter

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'city', 'state', 'address']
    ordering_fields = ['price', 'created_at', 'bedrooms', 'bathrooms', 'area_sqft']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateUpdateSerializer
        return PropertySerializer

    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)
        print("Received files:", request.FILES)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property = serializer.save(owner=request.user)
        from rest_framework.response import Response
        from rest_framework import status
        return Response(PropertyCreateUpdateSerializer(property).data, status=status.HTTP_201_CREATED)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my_listings']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['verify_property', 'unverified_properties']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        # Upgrade user to owner if they're creating a property
        user = self.request.user
        if user.role == 'seeker':
            user.role = 'owner'
            user.save()
        
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        """
        Returns all properties owned by the current user.
        """
        properties = Property.objects.filter(owner=request.user)
        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def verify_property(self, request, pk=None):
        """
        Verify a property. Only admin can do this.
        """
        property = self.get_object()
        property.is_verified = request.data.get('is_verified', True)
        property.save()
        serializer = self.get_serializer(property)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unverified_properties(self, request):
        """
        Returns all unverified properties. Only admin can see this.
        """
        properties = Property.objects.filter(is_verified=False)
        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def deleted_properties(self, request):
        # Get all inactive (deleted) properties
        properties = Property.objects.filter(is_active=False)
        
        # Paginate the results
        page = self.paginate_queryset(properties)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsPropertySeeker()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Inquiry.objects.filter(property__owner=user)
        return Inquiry.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add(self, request, pk=None):
        property = Property.objects.get(pk=pk)
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            property=property
        )
        
        if created:
            return Response({'status': 'property added to favorites'})
        return Response({'status': 'property already in favorites'})
    
    @action(detail=True, methods=['delete'])
    def remove(self, request, pk=None):
        property = Property.objects.get(pk=pk)
        
        try:
            favorite = Favorite.objects.get(user=request.user, property=property)
            favorite.delete()
            return Response({'status': 'property removed from favorites'})
        except Favorite.DoesNotExist:
            return Response({'status': 'property not in favorites'}, status=status.HTTP_404_NOT_FOUND)

class NewProjectViewSet(viewsets.ModelViewSet):
    queryset = NewProject.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = NewProjectFilter
    search_fields = ['name', 'builder_name', 'description', 'city', 'state', 'location']
    ordering_fields = ['launch_date', 'possession_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return NewProjectCreateUpdateSerializer
        return NewProjectSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save(added_by=request.user)
        images = request.FILES.getlist('images')
        for image in images:
            ProjectImage.objects.create(project=project, image=image)
        from rest_framework.response import Response
        from rest_framework import status
        return Response(NewProjectCreateUpdateSerializer(project).data, status=status.HTTP_201_CREATED)
    

    def get_permissions(self):
        if self.action in ['approve_project', 'unapproved_projects']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsProjectCreator()]
        elif self.action in ['approve_project', 'unapproved_projects']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        # The current implementation incorrectly returns Property objects
        # queryset = Property.objects.all()
        
        # This should return NewProject objects instead
        queryset = NewProject.objects.all()
        
        # For regular list view, only show approved projects for non-admin users
        if self.action == 'list' and not (self.request.user.is_authenticated and self.request.user.role == 'admin'):
            queryset = queryset.filter(is_approved=True)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_projects(self, request):
        """
        Returns all projects added by the current user.
        """
        projects = NewProject.objects.filter(added_by=request.user)  # Fixed to filter by current user
        page = self.paginate_queryset(projects)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def soft_delete(self, request, pk=None):
        property = self.get_object()
        
        # Check if the user is the owner of the property
        if property.owner != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to delete this property."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Soft delete the property
        property.is_active = False
        property.save()
        
        return Response(
            {"detail": "Property has been successfully removed."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['patch'])
    def approve_project(self, request, pk=None):
        try:
            project = self.get_object()
            project.is_approved = True
            project.save()
            return Response({'status': 'project approved'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def unapproved_projects(self, request):
        """
        Admin-only endpoint to list all unapproved projects.
        """
        projects = NewProject.objects.filter(is_approved=False)
        page = self.paginate_queryset(projects)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(projects, many=True)
        return Response(serializer.data)


# Add these functions to your existing views.py file
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_role(request):
    return Response({
        'username': request.user.username,
        'role': request.user.role,
        'is_authenticated': request.user.is_authenticated,
        'user_id': request.user.id
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_owner(request):
    """
    Custom registration endpoint for property owners.
    Automatically assigns the 'owner' role.
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.role = 'owner'
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_seeker(request):
    """
    Custom registration endpoint for property seekers.
    Automatically assigns the 'seeker' role.
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.role = 'seeker'
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    phone = request.data.get('phone')
    password = request.data.get('password')
    
    if not phone or not password:
        return Response({'error': 'Please provide both phone and password'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, phone=phone, password=password)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """
    Send OTP verification code via Twilio.
    This is a placeholder for future implementation.
    """
    phone = request.data.get('phone')
    
    if not phone:
        return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # TODO: Implement Twilio SMS verification
    # 1. Generate a random verification code
    # 2. Save it to the user's profile or a separate model with expiration
    # 3. Send it via Twilio SMS API
    
    return Response({'message': 'Verification code sent'})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_phone(request):
    """
    Verify phone number with OTP code.
    This is a placeholder for future implementation.
    """
    phone = request.data.get('phone')
    code = request.data.get('code')
    
    if not phone or not code:
        return Response({'error': 'Phone number and verification code are required'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # TODO: Implement verification logic
    # 1. Check if the code matches what was sent
    # 2. Update user's is_phone_verified flag
    
    try:
        user = User.objects.get(phone=phone)
        user.is_phone_verified = True
        user.save()
        return Response({'message': 'Phone number verified successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@action(detail=False, methods=['get'])
def trending_locations(self, request):
    """
    Returns the most popular locations based on property count
    """
    from django.db.models import Count
    
    # Get top cities
    top_cities = Property.objects.filter(is_active=True, is_verified=True)\
        .values('city')\
        .annotate(count=Count('city'))\
        .order_by('-count')[:10]
        
    # Get top states
    top_states = Property.objects.filter(is_active=True, is_verified=True)\
        .values('state')\
        .annotate(count=Count('state'))\
        .order_by('-count')[:10]
        
    result = {
        'cities': top_cities,
        'states': top_states
    }
    
    return Response(result)

import random
import requests
from .models_otp import EmailOTP

@api_view(['POST'])
def register_view(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Generate OTP
        otp = f"{random.randint(100000, 999999)}"
        # Store OTP
        EmailOTP.objects.create(email=user.email, otp=otp)
        # Send OTP via Node.js mailer
        try:
            requests.post('http://localhost:5001/send-otp', json={'email': user.email, 'otp': otp}, timeout=5)
        except Exception as e:
            print(f"Failed to send OTP email: {e}")
        return Response({
            'user_id': user.id,
            'email': user.email,
            'message': 'User registered. OTP sent to email.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def verify_email_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    if not email or not otp:
        return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        email_otp = EmailOTP.objects.filter(email=email, otp=otp).latest('created_at')
        if email_otp.is_valid():
            # Mark user as verified
            from .models import User
            user = User.objects.get(email=email)
            user.is_phone_verified = True
            user.save()
            return Response({'message': 'Email verified successfully'})
        else:
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)
    except EmailOTP.DoesNotExist:
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)


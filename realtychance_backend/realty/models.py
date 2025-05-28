from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    """Define a model manager for User model with phone number as the unique identifier."""

    def create_user(self, phone, email, password=None, **extra_fields):
        """Create and save a User with the given phone, email and password."""
        if not phone:
            raise ValueError('The Phone number must be set')
        email = self.normalize_email(email)
        user = self.model(phone=phone, email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, phone, email, password=None, **extra_fields):
        """Create and save a SuperUser with the given phone, email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(phone, email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('owner', 'Property Owner'),
        ('seeker', 'Property Seeker'),
        ('admin', 'Administrator'),
    )
    
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    phone = models.CharField(max_length=15, unique=True, default='')  # Add default value here
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=255, blank=True, default='')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='seeker')
    is_phone_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['email', 'full_name']
    
    objects = UserManager()
    
    def __str__(self):
        return self.full_name or self.phone
    
    def save(self, *args, **kwargs):
        # Check if this is a new user being created through admin
        if not self.pk and hasattr(self, '_from_admin') and self._from_admin:
            # Set default role to admin for users created in Django admin
            if not self.role or self.role == 'seeker':
                self.role = 'admin'
        
        # For existing users, preserve their role if not explicitly changed
        elif self.pk:
            try:
                old_user = User.objects.get(pk=self.pk)
                if not self.role:
                    self.role = old_user.role
            except User.DoesNotExist:
                pass
                
        super().save(*args, **kwargs)


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = (
        ('sale', 'For Sale'),
        ('rent', 'For Rent'),
        ('lease', 'Lease'),
        ('pg', 'Paying Guest'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    bedrooms = models.PositiveIntegerField()
    bathrooms = models.PositiveIntegerField()
    area_sqft = models.PositiveIntegerField()
    property_type = models.CharField(max_length=10, choices=PROPERTY_TYPE_CHOICES)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    address = models.TextField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Properties"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/')
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image for {self.property.title}"

class Inquiry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiries')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='inquiries')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Inquiry from {self.user.username} for {self.property.title}"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'property')
    
    def __str__(self):
        return f"{self.user.username}'s favorite: {self.property.title}"

class NewProject(models.Model):
    PROJECT_TYPE_CHOICES = (
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('mixed', 'Mixed Use'),
    )
    
    name = models.CharField(max_length=255)
    builder_name = models.CharField(max_length=255)
    description = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    launch_date = models.DateField()
    possession_date = models.DateField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES)
    amenities = models.TextField()
    is_approved = models.BooleanField(default=False)
    added_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class ProjectImage(models.Model):
    project = models.ForeignKey(NewProject, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='project_images/')
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image for {self.project.name}"

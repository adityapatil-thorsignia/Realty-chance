from rest_framework import serializers
from .models import User, Property, PropertyImage, Inquiry, Favorite, NewProject, ProjectImage
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone', 'email', 'full_name', 'role', 'is_phone_verified']
        read_only_fields = ['role', 'is_phone_verified']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['phone', 'email', 'full_name', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate phone number format (you can customize this)
        phone = attrs['phone']
        if not phone.isdigit() or len(phone) < 10:
            raise serializers.ValidationError({"phone": "Enter a valid phone number."})
            
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            phone=validated_data['phone'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name']
        )
        return user

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_primary']

class PropertySerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Property
        fields = '__all__'

class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    # Do NOT declare an images field here! Handle images in create/update using request.FILES.getlist('images')

    class Meta:
        model = Property
        fields = [
            'title', 'description', 'price', 'bedrooms', 'bathrooms', 'area_sqft',
            'property_type', 'city', 'state', 'address'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        images = request.FILES.getlist('images') if request else []
        print("DEBUG: Files in request:", request.FILES)
        print("DEBUG: Images to save:", images)
        # Check if 'owner' is in validated_data and remove it to avoid duplicate
        if 'owner' in validated_data:
            validated_data.pop('owner')
        property = Property.objects.create(owner=request.user, **validated_data)
        for image in images:
            try:
                print("DEBUG: Saving image:", image)
                PropertyImage.objects.create(property=property, image=image)
            except Exception as e:
                print("ERROR saving PropertyImage:", e)
        return property

    def update(self, instance, validated_data):
        request = self.context.get('request')
        images = request.FILES.getlist('images') if request else []
        print("DEBUG (update): Files in request:", request.FILES)
        print("DEBUG (update): Images to save:", images)
        # Update property fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Add new images if provided
        for image in images:
            try:
                print("DEBUG (update): Saving image:", image)
                PropertyImage.objects.create(property=instance, image=image)
            except Exception as e:
                print("ERROR saving PropertyImage (update):", e)
        return instance


class InquirySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    property = PropertySerializer(read_only=True)
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(),
        write_only=True,
        source='property'
    )
    
    class Meta:
        model = Inquiry
        fields = ['id', 'user', 'property', 'property_id', 'message', 'created_at']
        read_only_fields = ['user', 'created_at']

class FavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    property = PropertySerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'property', 'created_at']
        read_only_fields = ['user', 'created_at']

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'is_primary']

class NewProjectSerializer(serializers.ModelSerializer):
    added_by = UserSerializer(read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = NewProject
        fields = '__all__'

class NewProjectCreateUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = NewProject
        fields = [
            'name', 'builder_name', 'description', 'city', 'state', 'location',
            'launch_date', 'possession_date', 'project_type', 'amenities'
        ]
    
    def create(self, validated_data):
        # Check if 'added_by' is in validated_data and remove it to avoid duplicate
        if 'added_by' in validated_data:
            validated_data.pop('added_by')
            
        def validate(self, attrs):
            # Get the current user
            user = self.context['request'].user
            
            # Check for duplicate properties by the same owner with the same address
            if Property.objects.filter(
                owner=user,
                address=attrs.get('address'),
                is_active=True
            ).exists():
                raise serializers.ValidationError(
                    {"address": "You already have an active property listing with this address."}
                )
            
            return attrs
        
        # Get the current user    
        user = self.context['request'].user
        
        # Create the project
        project = NewProject.objects.create(added_by=user, **validated_data)
        
        # Update user role to owner if they're not already an owner or admin
        if user.role == 'seeker':
            user.role = 'owner'
            user.save()
        
        # Add images if provided
        for image_data in images_data:
            ProjectImage.objects.create(project=project, image=image_data)
            
        return project
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        
        # Update project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new images if provided
        for image_data in images_data:
            ProjectImage.objects.create(project=instance, image=image_data)
            
        return instance
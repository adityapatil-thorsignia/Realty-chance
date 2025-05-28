from django_filters import rest_framework as filters
from .models import Property, NewProject
from django.db import models  # Add this import

class PropertyFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    bedrooms = filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    bathrooms = filters.NumberFilter(field_name="bathrooms", lookup_expr="gte")
    min_area = filters.NumberFilter(field_name="area_sqft", lookup_expr="gte")
    city = filters.CharFilter(field_name="city", lookup_expr="iexact")
    property_type = filters.CharFilter(field_name="property_type", lookup_expr="iexact")
    state = filters.CharFilter(field_name="state", lookup_expr="iexact")

    location_keyword = filters.CharFilter(method="filter_location")
    is_verified = filters.BooleanFilter(field_name="is_verified")
    owner = filters.NumberFilter(field_name="owner__id")
    trending = filters.BooleanFilter(method="filter_trending")

    def filter_location(self, queryset, name, value):
        """Filter properties by any location field containing the keyword"""
        if not value:
            return queryset
        return queryset.filter(
            models.Q(city__icontains=value) | 
            models.Q(state__icontains=value) |
            models.Q(address__icontains=value)
        )
    
    def filter_trending(self, queryset, name, value):
        """Filter trending properties (most viewed or favorited)"""
        if value:
            # Get properties with the most favorites
            # This is a simple implementation - could be enhanced with view counts
            from django.db.models import Count
            return queryset.annotate(favorite_count=Count('favorited_by')).order_by('-favorite_count')
        return queryset

    class Meta:
        model = Property
        fields = [
            "city", "state", "price", "bedrooms", "bathrooms", 
            "property_type", "is_verified", "owner",
            "min_area", "location_keyword", "trending"
        ]

class NewProjectFilter(filters.FilterSet):
    city = filters.CharFilter(lookup_expr="iexact")
    state = filters.CharFilter(lookup_expr="iexact")
    location_keyword = filters.CharFilter(method="filter_location")
    possession_year = filters.NumberFilter(method="filter_by_year")
    price_range_start = filters.NumberFilter(method="filter_price_range_start")
    price_range_end = filters.NumberFilter(method="filter_price_range_end")
    is_approved = filters.BooleanFilter(field_name="is_approved")
    added_by = filters.NumberFilter(field_name="added_by__id")
    project_type = filters.CharFilter(field_name="project_type", lookup_expr="iexact")
    trending = filters.BooleanFilter(method="filter_trending")

    def filter_location(self, queryset, name, value):
        """Filter projects by any location field containing the keyword"""
        if not value:
            return queryset
        return queryset.filter(
            models.Q(city__icontains=value) | 
            models.Q(state__icontains=value) | 
            models.Q(location__icontains=value)
        )

    def filter_by_year(self, queryset, name, value):
        return queryset.filter(possession_date__year=value)
    
    def filter_price_range_start(self, queryset, name, value):
        # Implement your price range filtering logic here
        # This is just an example - adjust based on your model structure
        return queryset.filter(price__gte=value)
    
    def filter_price_range_end(self, queryset, name, value):
        # Implement your price range filtering logic here
        return queryset.filter(price__lte=value)
    
    def filter_trending(self, queryset, name, value):
        """Filter trending projects"""
        if value:
            # Sort by newest first as a simple trending implementation
            # Could be enhanced with view counts or other metrics
            return queryset.order_by('-created_at')
        return queryset

    class Meta:
        model = NewProject
        fields = [
            "city", "state", "project_type", "is_approved", 
            "added_by", "location_keyword", "trending"
        ]
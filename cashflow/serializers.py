from rest_framework import serializers
from .models import Status, Type, Category, Subcategory, CashFlow


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class SubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subcategory
        fields = '__all__'


class CashFlowSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)
    type_name = serializers.CharField(source='type.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)

    status_id = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), source='status')
    type_id = serializers.PrimaryKeyRelatedField(queryset=Type.objects.all(), source='type')
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category')
    subcategory_id = serializers.PrimaryKeyRelatedField(queryset=Subcategory.objects.all(), source='subcategory')

    class Meta:
        model = CashFlow
        fields = [
            'id', 'amount', 'custom_date',
            'status_id', 'type_id', 'category_id', 'subcategory_id',
            'status_name', 'type_name', 'category_name', 'subcategory_name',
            'comment'
        ]

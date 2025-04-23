from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('add/', views.add_cashflow, name='add_cashflow'),
    path('cashflow/update/<int:cashflow_id>/', views.update_cashflow, name='update_cashflow'),
    path('directories/', views.directories_view, name='directories_view'),

    path('api/v1/cashflows/', views.CashFlowListAPIView.as_view(), name='cashflow-list'),
    path('api/v1/cashflows/create/', views.CashFlowCreateUpdateAPIView.as_view(), name='cashflow-create'),
    path('api/v1/get-statuses/', views.StatusListAPIView.as_view(), name='get_statuses'),
    path('api/v1/get-types/', views.TypeListAPIView.as_view(), name='get_types'),
    path('api/v1/get-categories/', views.CategoryListAPIView.as_view(), name='get_categories'),
    path('api/v1/get-subcategories/', views.SubcategoryListAPIView.as_view(), name='get_subcategories'),
    path('api/v1/cashflows/update/<int:pk>/', views.CashFlowDetailAPIView.as_view(), name='cashflow-detail'),

    path('api/v1/status/', views.StatusListCreateAPIView.as_view(), name='statuses-list-create'),
    path('api/v1/status/<int:pk>/', views.StatusRetrieveUpdateDestroyAPIView.as_view(), name='statuses-detail'),
    path('api/v1/type/', views.TypeListCreateAPIView.as_view(), name='types-list-create'),
    path('api/v1/type/<int:pk>/', views.TypeRetrieveUpdateDestroyAPIView.as_view(), name='types-detail'),
    path('api/v1/category/', views.CategoryListCreateAPIView.as_view(), name='categories-list-create'),
    path('api/v1/category/<int:pk>/', views.CategoryRetrieveUpdateDestroyAPIView.as_view(), name='categories-detail'),
    path('api/v1/subcategory/', views.SubcategoryListCreateAPIView.as_view(), name='subcategories-list-create'),
    path('api/v1/subcategory/<int:pk>/', views.SubcategoryRetrieveUpdateDestroyAPIView.as_view(), name='subcategories-detail'),

]
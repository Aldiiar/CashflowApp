from django.contrib import admin
from .models import CashFlow, Status, Category, Subcategory, Type

admin.site.register(CashFlow)
admin.site.register(Status)
admin.site.register(Category)
admin.site.register(Subcategory)
admin.site.register(Type)
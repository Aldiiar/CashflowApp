from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.exceptions import ValidationError
from .models import CashFlow, Status, Type, Category, Subcategory
from .serializers import CashFlowSerializer, StatusSerializer, TypeSerializer, CategorySerializer, SubcategorySerializer


# Главная страница, отображает фильтры для поиска по статусам, типам, категориям и подкатегориям
def index(request):
    statuses = Status.objects.all()
    types = Type.objects.all()
    categories = Category.objects.all()
    subcategories = Subcategory.objects.all()

    return render(
        request, 'index.html',
        {
            'statuses': statuses,
            'types': types,
            'categories': categories,
            'subcategories': subcategories
        }
    )


# API для получения списка записей о движении денежных средств с возможностью фильтрации по различным параметрам
class CashFlowListAPIView(APIView):
    def get(self, request):
        # Получение фильтров из запроса
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        status_id = request.GET.get('status')
        type_id = request.GET.get('type')
        category_id = request.GET.get('category')
        subcategory_id = request.GET.get('subcategory')

        q_objects = Q()

        if date_from:
            q_objects &= Q(custom_date__gte=parse_date(date_from))

        if date_to:
            q_objects &= Q(custom_date__lte=parse_date(date_to))

        if status_id:
            q_objects &= Q(status_id=status_id)

        if type_id:
            q_objects &= Q(type_id=type_id)

        if category_id:
            q_objects &= Q(category_id=category_id)

        if subcategory_id:
            q_objects &= Q(subcategory_id=subcategory_id)

        # Получение записей
        cashflows = CashFlow.objects.select_related(
            'status', 'type', 'category', 'subcategory'
        ).filter(q_objects).order_by('-custom_date')

        serializer = CashFlowSerializer(cashflows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ======================================================================================================================


# Страница для добавления новой записи о движении денежных средств
def add_cashflow(request):
    filters = {
        'status': '',
        'type': '',
        'category': '',
        'subcategory': '',
        'amount': '',
        'comment': '',
    }

    return render(request, 'add_cashflow.html', {
        'filters': filters,
        'statuses': Status.objects.all(),
        'types': Type.objects.all(),
        'categories': [],
        'subcategories': [],
    })


# API для создания и обновления записей о движении денежных средств
class CashFlowCreateUpdateAPIView(APIView):

    def get(self, request, *args, **kwargs):
        # Получаем данные для фильтров
        statuses = Status.objects.all()
        types = Type.objects.all()
        categories = []
        subcategories = []

        # Если тип выбран, фильтруем категории и подкатегории
        type_id = request.GET.get('type')
        category_id = request.GET.get('category')

        if type_id:
            categories = Category.objects.filter(type_id=type_id)
            if category_id:
                subcategories = Subcategory.objects.filter(category_id=category_id)

        data = {
            'statuses': [{'id': s.id, 'name': s.name} for s in statuses],
            'types': [{'id': t.id, 'name': t.name} for t in types],
            'categories': [{'id': c.id, 'name': c.name} for c in categories],
            'subcategories': [{'id': s.id, 'name': s.name} for s in subcategories]
        }

        return Response(data)

    def post(self, request, *args, **kwargs):
        # Получаем данные из запроса
        status_id = request.data.get('status')
        type_id = request.data.get('type')
        category_id = request.data.get('category')
        subcategory_id = request.data.get('subcategory')
        amount = request.data.get('amount')
        comment = request.data.get('comment')

        # Проверка на обязательные поля
        if not all([status_id, type_id, category_id, subcategory_id, amount]):
            raise ValidationError('Все поля обязательны.')

        # Проверка существования статуса
        if not Status.objects.filter(id=status_id).exists():
            raise ValidationError('Неверный статус.')

        # Проверка на положительность суммы
        if float(amount) <= 0:
            raise ValidationError('Сумма должна быть положительным числом.')

        # Создание записи с автоматической датой
        cashflow = CashFlow(
            status_id=status_id,
            type_id=type_id,
            category_id=category_id,
            subcategory_id=subcategory_id,
            amount=amount,
            comment=comment,
            custom_date=timezone.now()
        )
        cashflow.save()

        return Response({'message': 'Запись успешно добавлена!', 'redirect_url': '/'}, status=status.HTTP_201_CREATED)


# API для получения списка всех статусов
class StatusListAPIView(APIView):
    def get(self, request):
        statuses = Status.objects.all().values('id', 'name')
        return Response({'statuses': list(statuses)}, status=status.HTTP_200_OK)


# API для получения списка всех типов
class TypeListAPIView(APIView):
    def get(self, request):
        types = Type.objects.all().values('id', 'name')
        return Response({'types': list(types)}, status=status.HTTP_200_OK)


# API для получения списка категорий, с фильтрацией по типу
class CategoryListAPIView(APIView):
    def get(self, request):
        type_id = request.GET.get('type_id')
        categories = Category.objects.all()
        if type_id:
            categories = categories.filter(type_id=type_id)
        categories_data = categories.values('id', 'name')
        return Response({'categories': list(categories_data)}, status=status.HTTP_200_OK)


# API для получения списка подкатегорий, с фильтрацией по категории
class SubcategoryListAPIView(APIView):
    def get(self, request):
        category_id = request.GET.get('category_id')
        subcategories = Subcategory.objects.all()
        if category_id:
            subcategories = subcategories.filter(category_id=category_id)
        subcategories_data = subcategories.values('id', 'name')
        return Response({'subcategories': list(subcategories_data)}, status=status.HTTP_200_OK)


# Страница для обновления существующей записи о движении денежных средств
def update_cashflow(request, cashflow_id):
    cashflow = get_object_or_404(CashFlow, id=cashflow_id)

    statuses = Status.objects.values('id', 'name').distinct()
    types = Type.objects.values('id', 'name').distinct()
    categories = Category.objects.filter(type_id=cashflow.type.id).values('id', 'name').distinct()
    subcategories = Subcategory.objects.filter(category_id=cashflow.category.id).values('id', 'name').distinct()

    # Создаем context вне зависимости от типа запроса
    context = {
        'cashflow': cashflow,
        'statuses': statuses,
        'types': types,
        'categories': categories,
        'subcategories': subcategories,
    }
    # Обработка GET-запроса
    if request.method == 'GET':
        return render(request, 'update_cashflow.html', context=context)


# API для получения, обновления и удаления конкретной записи о движении денежных средств
class CashFlowDetailAPIView(APIView):
    def get(self, request, pk):
        cashflow = get_object_or_404(CashFlow, id=pk)
        serializer = CashFlowSerializer(cashflow)
        return Response(serializer.data)

    def post(self, request, pk):
        cashflow = get_object_or_404(CashFlow, id=pk)

        status_id = request.data.get('status')
        type_id = request.data.get('type')
        category_id = request.data.get('category')
        subcategory_id = request.data.get('subcategory')
        amount = request.data.get('amount')
        comment = request.data.get('comment')
        custom_date = request.data.get('custom_date')

        data = {
            "status_id": status_id,
            "type_id": type_id,
            "category_id": category_id,
            "subcategory_id": subcategory_id,
            "amount": amount,
            "comment": comment,
            "custom_date": custom_date
        }

        serializer = CashFlowSerializer(cashflow, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'redirect': '/'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        cashflow = get_object_or_404(CashFlow, id=pk)
        print(cashflow)
        cashflow.delete()
        return Response({'redirect': '/'})


# ======================================================================================================================


# Эта функция отвечает за рендеринг страницы с перечнем всех справочников: Статусов, Типов, Категорий и Подкатегорий
# Он обрабатывает только GET-запросы и передает в шаблон все существующие записи
def directories_view(request):
    if request.method == 'GET':
        statuses = Status.objects.all()
        types = Type.objects.all()
        categories = Category.objects.all()
        subcategories = Subcategory.objects.all()

        context = {
            'statuses': statuses,
            'types': types,
            'categories': categories,
            'subcategories': subcategories,
        }

        return render(request, 'directories.html', context=context)


# Views для получения, обновления и удаления справочников
class StatusListCreateAPIView(generics.ListCreateAPIView):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer


class StatusRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer


class TypeListCreateAPIView(generics.ListCreateAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer


class TypeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer


class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class SubcategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer


class SubcategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer

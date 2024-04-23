from .models import Shop, Products
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear




def count_products_by_period(period):
    trunc_function = TruncMonth if period == 'month' else TruncQuarter if period == 'quarter' else TruncYear
    group_field = 'month' if period == 'month' else 'quarter' if period == 'quarter' else 'year'

    return (
        Products.objects.annotate(**{group_field: trunc_function('created_date')})
        .values('shop_id', 'shop_id__name', group_field)
        .annotate(product_count=Count('id'))
        .order_by('shop_id','shop_id__name', group_field)
    )
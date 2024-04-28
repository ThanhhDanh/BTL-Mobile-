from .models import Shop, Products, Orders
from django.db.models import Count, Sum, Min
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear, TruncDate, Cast, Concat, Extract
from datetime import datetime, timedelta
from django.db import models


def count_products_sold_by_period(period):
    trunc_function = TruncMonth if period == 'month' else TruncQuarter if period == 'quarter' else TruncYear
    group_field = 'month' if period == 'month' else 'quarter' if period == 'quarter' else 'year'

    # Kiểm tra xem liệu đầu vào có phải là một số nguyên hợp lệ (từ 1 đến 12) không
    try:
        month = int(period)
        if month < 1 or month > 12:
            raise ValueError("Tháng không hợp lệ")
    except ValueError:
        raise ValueError("Tháng không hợp lệ")

    now = datetime.now()
    year = now.year

    # Tính ngày đầu tiên của tháng được chỉ định
    start_date = datetime(year, month, 1)

    # Tính ngày cuối cùng của tháng được chỉ định bằng cách lấy ngày cuối cùng của tháng tiếp theo và trừ đi một ngày
    end_date = datetime(year, month % 12 + 1, 1) - timedelta(days=1)
    return (
        # Products.objects.annotate(**{group_field: trunc_function('created_date')},
        #                           order_count=Count('orders',filter=models.Q(orders__orderStatus='đã thanh toán')))
        # .values('shop_id', 'shop_id__name','order_count', group_field)
        # .annotate(product_count=Count('id'))
        # .annotate(min_order_date=Min('orders__created_date'))
        # .order_by('shop_id','shop_id__name', group_field)
        Products.objects.filter(created_date__gte=start_date, created_date__lte=end_date)
        .annotate(month=TruncMonth('created_date'))
        .annotate(order_count=Count('orders', filter=models.Q(orders__orderStatus='đã thanh toán')))
        .values('shop_id', 'shop_id__name', 'order_count', 'month')
        .annotate(product_count=Count('id'))
        .annotate(min_order_date=Min('orders__created_date'))
        .annotate(total_revenue=Sum('orders__totalPrice'))
        .order_by('shop_id', 'shop_id__name', 'month')
    )


def count_products_by_month(month):
    try:
        month = int(month)
        if month < 1 or month > 12:
            raise ValueError("Tháng không hợp lệ")
    except ValueError:
        raise ValueError("Tháng không hợp lệ")

    now = datetime.now()
    year = now.year

    # Tính ngày đầu tiên và cuối cùng của tháng được chỉ định
    start_date = datetime(year, month, 1)
    end_date = datetime(year, month % 12 + 1, 1) - timedelta(days=1)

    # Lọc sản phẩm theo tháng và tính tổng số sản phẩm cho mỗi cửa hàng
    return (
        Products.objects.filter(created_date__gte=start_date, created_date__lte=end_date)
        .values('shop_id__name')
        .annotate(total_products=Count('id'))
        .annotate(product__created_date=Min('created_date'))
        .order_by('shop_id__name')
    )

# def calculate_revenue_by_period(period):
#     trunc_function = TruncMonth if period == 'month' else TruncQuarter if period == 'quarter' else TruncYear
#     group_field = 'month' if period == 'month' else 'quarter' if period == 'quarter' else 'year'
#
#     return (
#         Orders.objects.annotate(**{group_field: trunc_function('created_date')})
#         .values(group_field)
#         .annotate(total_revenue=Sum('totalPrice'))
#         .order_by(group_field)
#     )

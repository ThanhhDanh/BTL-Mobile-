from .models import Shop, Products, Orders
from django.db.models import Count, Sum, Min, F, Q
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear, TruncDate, Cast, Concat, Extract
from datetime import datetime, timedelta
from django.db import models
from django.utils import timezone
import calendar


def count_products_sold_by_period(period):
    trunc_function = TruncMonth if period == 'month' else TruncQuarter if period == 'quarter' else TruncYear
    group_field = 'month' if period == 'month' else 'quarter' if period == 'quarter' else 'year'

    return (
        Orders.objects.filter(created_date__month=period)
        .annotate(month=trunc_function('created_date'))
        .annotate(
            ordersStatus=Count('id', filter=Q(orderStatus='đã thanh toán'))
        )  # Đếm số đơn đã thanh toán
        .values('shop_id__name', 'ordersStatus', 'month')  # Chọn các trường để hiển thị
        .annotate(min_order_date=Min('created_date'))  # Tìm ngày đặt hàng đầu tiên trong tháng
        .annotate(total_revenue=Sum('totalPrice'))  # Tính tổng doanh thu
        .annotate(orders_count=Count('id'))  # Đếm tổng số đơn
        .order_by('shop_id__name','month')  # Sắp xếp theo tháng
    )


def count_products_by_month(period):
    trunc_function = TruncMonth if period == 'month' else TruncQuarter if period == 'quarter' else TruncYear
    group_field = 'month' if period == 'month' else 'quarter' if period == 'quarter' else 'year'

    # Lọc sản phẩm theo tháng và tính tổng số sản phẩm cho mỗi cửa hàng
    return (
        Products.objects.filter(created_date__month=period)
        .annotate(month=trunc_function('created_date'))
        .values('shop_id__name','month')
        .annotate(total_products=Count('id'))
        .annotate(product__created_date=Min('created_date'))
        .exclude(shop_id__name=None)
        .order_by('shop_id__name')
    )




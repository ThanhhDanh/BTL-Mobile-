import cloudinary
from django.contrib import admin
from django.template.response import TemplateResponse
from django.utils.html import mark_safe
from courses.models import Category, Products, Reviews, Orders, User, Tag, Comment, Like, Shop
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.views import View
from django.shortcuts import render
from django.urls import path
from django.utils.html import format_html
from django.contrib.admin.views.decorators import staff_member_required
from django import forms
from django.db.models import Count
from .dao import *



class UserForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)
    class Meta:
        model = User
        fields = '__all__'

    role = forms.ChoiceField(choices=User.RoleChoices.choices)


class MyUserAdmin(admin.ModelAdmin):
    readonly_fields = ['user_image']
    form = UserForm

    def user_image(self, instance):
        if instance.avatar:
            if "cloudinary.com" in instance.avatar.url:
                return mark_safe(f"<img width='140' src='{instance.avatar.url}' />")
            else:
                return mark_safe(f"<img width='140' src='/static/{instance.avatar.name}' />")
        return "Không có ảnh"


class ProductForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Products
        fields = '__all__'


class MyProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'priceProduct', 'created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']
    readonly_fields = ['my_image']
    form = ProductForm

    def my_image(self, instance):
        if instance.image:
            if "cloudinary.com" in instance.image.url:
                return mark_safe(f"<img width='140' src='{instance.image.url}' />")
            else:
                return mark_safe(f"<img width='140' src='/static/{instance.image.name}' />")
        return "Không có ảnh"

    class Media:
        css = {
            'all': ('/static/css/style.css',)
        }


# def stats_view(request):
#     if request.method == "GET":
#         month = request.GET.get('month', None)
#         # Xử lý logic thống kê tại đây nếu cần
#         context = {
#             'month': month,
#             # Các dữ liệu thống kê khác có thể được truyền vào context
#         }
#     return render(request, 'admin/stats.html', context)
#
#
# class StatsAdminView(admin.AdminSite):
#     site_header = 'Hệ Thống sàn giao dịch thương mại điện tử'
#     def get_urls(self):
#         urls = super().get_urls()
#         custom_urls = [
#             path('stats/', self.admin_view(stats_view), name='stats'),
#         ]
#         return custom_urls + urls
#
#
# admin_site = StatsAdminView(name='Stats')

class ShopAppAdminSite(admin.AdminSite):
    site_header = 'Hệ Thống sàn giao dịch thương mại điện tử'

    def get_urls(self):
        urls = super().get_urls()
        return [path('shop-stats/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        month = request.GET.get('month')
        count_products = count_products_by_period(period=month)
        shop_stats = Category.objects.annotate(c=Count('shop__id')).values('id', 'name', 'c')

        return TemplateResponse(request, 'admin/stats.html', {
            "shop_stats": shop_stats,
            'count_products': count_products,
            'month': month
        })


admin_site = ShopAppAdminSite(name='Stats')



# admin.site.register(Category)
# admin.site.register(Products, MyProductAdmin)
# admin.site.register(Reviews)
# admin.site.register(Orders)
# admin.site.register(Shop)
# admin.site.register(User, MyUserAdmin)
# admin.site.register(Tag)
# admin.site.register(Comment)
# admin.site.register(Like)


admin_site.register(Category)
admin_site.register(Products, MyProductAdmin)
admin_site.register(Reviews)
admin_site.register(Orders)
admin_site.register(Shop)
admin_site.register(User)
admin_site.register(Tag)
admin_site.register(Comment)
admin_site.register(Like)


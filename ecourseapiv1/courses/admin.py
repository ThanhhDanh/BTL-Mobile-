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
from datetime import datetime
from django.http import HttpResponse






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


class ShopForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Shop
        fields = '__all__'


class MyShopAdmin(admin.ModelAdmin):
    readonly_fields = ['avatar']
    form=ShopForm
    def avatar(self, instance):
        if instance.image:
            if "cloudinary.com" in instance.image.url:
                return mark_safe(f"<img width='140' src='{instance.image.url}' />")
            else:
                return mark_safe(f"<img width='140' src='/static/{instance.image.name}' />")
        return "Không có ảnh"


class AppAdminSite(admin.AdminSite):
    site_header = 'Hệ Thống sàn giao dịch thương mại điện tử'
    index_title = 'Welcome'
    stats_url = 'admin/stats.html'

    def get_urls(self):
        urls = super().get_urls()
        return [path('stats/', self.stats_view, name='stats_view')] + super().get_urls()

    def index(self, request, extra_context=None):
        # Thêm extra_context để hiển thị liên kết trong trang admin
        extra_context = extra_context or {}
        extra_context['stats_url'] = self.stats_url  # URL của trang stats
        return super().index(request, extra_context=extra_context)


    def stats_view(self, request):
        month = request.GET.get('month')
        if month is not None:

            count_products = count_products_sold_by_period(period=month)

            #shop_stats = Category.objects.annotate(c=Count('shop__id')).values('id', 'name', 'c')
            shop_stats = count_products_by_month(month=month)
            return TemplateResponse(request, 'admin/stats.html', {
                "shop_stats": shop_stats,
                'count_products': count_products,
                'month': month
                })
        else:
            return TemplateResponse(request, 'admin/stats.html')


admin_site = AppAdminSite(name='Stats')




admin_site.register(Category)
admin_site.register(Products, MyProductAdmin)
admin_site.register(Reviews)
admin_site.register(Orders)
admin_site.register(Shop,MyShopAdmin)
admin_site.register(User)
admin_site.register(Tag)
admin_site.register(Comment)
admin_site.register(Like)


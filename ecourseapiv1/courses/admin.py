import cloudinary
from django.contrib import admin
from django.utils.html import mark_safe
from courses.models import Category, Products, Reviews, Orders, User, Tag, Comment, Like, Shop
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget


class ProductForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Products
        fields = '__all__'


class MyProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'priceProduct','created_date', 'updated_date', 'active']
    search_fields = ['name', 'description']
    list_filter = ['id', 'created_date', 'name']
    readonly_fields = ['my_image']
    form = ProductForm

    def my_image(self, instance):
        if instance:
            if instance.image is cloudinary.CloudinaryResource:
                return mark_safe(f"<img width='120' src='{instance.image.url}' />")

            return mark_safe(f"<img width='120' src='/static/{instance.image.name}' />")

    class Media:
        css = {
            'all': ('/static/css/style.css', )
        }


admin.site.register(Category)
admin.site.register(Products, MyProductAdmin)
admin.site.register(Reviews)
admin.site.register(Orders)
admin.site.register(Shop)
admin.site.register(User)
admin.site.register(Tag)
admin.site.register(Comment)
admin.site.register(Like)

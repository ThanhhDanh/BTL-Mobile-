from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from courses import views
from .admin import admin
from django.views.generic import TemplateView
from .admin import admin_site


r = routers.DefaultRouter()
r.register('categories', views.CategoryViewSet, basename='categories')
r.register('products', views.ProductViewSet, basename='products')
r.register('users', views.UserViewSet, basename='users')
r.register('comments', views.CommentViewSet, basename='comments')
r.register('shops', views.ShopViewSet, basename='shops')
r.register('orders', views.OrderViewSet, basename='orders')
r.register('reviews', views.ReviewViewSet, basename='reviews')


urlpatterns = [
    path('', include(r.urls)),
    path('stats/', admin_site.stats_view , name='stats_view'),
    #path('<int:pk>/', ShopListView.as_view() , name='shop'),
]


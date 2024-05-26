from rest_framework import viewsets, generics, status, parsers, permissions, filters
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.mixins import PermissionRequiredMixin
from courses import serializers, paginators, permission
from courses.models import Category, Products, Orders, Reviews, User, Comment, Like, Shop, Tag
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.views.generic import ListView, DetailView
from django.contrib.auth.models import AnonymousUser
from decimal import Decimal




class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer


class ShopViewSet(viewsets.ViewSet,generics.CreateAPIView, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Shop.objects.filter(active=True)
    serializer_class = serializers.ShopSerializer
    # pagination_class = paginators.ShopPaginator

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedProductDetailsSerializer

        return self.serializer_class

    def get_queryset(self):
        queryset = self.queryset
        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(name__icontains=q)

            product_name = self.request.query_params.get('p')
            if product_name:
                queryset = queryset.filter(product__name__icontains=product_name)

        return queryset

    @action(methods=['get'], url_path='products', detail=True)
    def get_products(self, request, pk):
        products = self.get_object().product.filter(active=True)
        q = request.query_params.get('q')
        if q:
            # Lọc sản phẩm dựa trên tên sản phẩm và loại bỏ những sản phẩm không khớp
            products = products.filter(name__icontains=q)

        return Response(serializers.ProductSerializer(products, many=True).data,
                        status=status.HTTP_200_OK)


class ProductViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView,generics.CreateAPIView):
    queryset = Products.objects.prefetch_related('tags').filter(active=True)
    serializer_class = serializers.ProductDetailsSerializer
    # pagination_class = paginators.ProductPaginator
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name','priceProduct','shop_id']
    search_fields = ['name','shop_id__name']
    ordering_fields = ['name','priceProduct']


    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                queryset = queryset.filter(name__icontains=q)

        #lọc theo giá
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price is not None:
            queryset = queryset.filter(priceProduct__gte=min_price)
        if max_price is not None:
            queryset =queryset.filter(priceProduct__lte=max_price)

        return queryset


    @action(methods=['get'], url_path='comment', detail=True)
    def get_comments(self, request, pk):
        # comments = self.get_object().comment_set.order_by('id')
        comments = self.get_object().comment_set.select_related('user').order_by('-id')
        # q = request.query_params.get('q')
        # if q:
        #     comments = comments.filter(content__icontains=q)

        #Phân trang cho comment
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)

    def get_permissions(self):
        if self.action in ['list', 'create']:
            if self.request.user.is_authenticated:
                return [permissions.IsAuthenticated()]
            else:
                return [permissions.AllowAny()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            if self.request.user.is_authenticated and self.request.user.role in [self.RoleChoices.ADMIN,
                                                                                 self.RoleChoices.EMPLOYEE,
                                                                                 self.RoleChoices.SELLER]:
                return [permissions.IsAuthenticated()]
            else:
                return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    # def get_permissions(self):
    #     if self.action in ['add_comment', 'like']:
    #         return [permissions.IsAuthenticated()]
    #
    #     return [permissions.AllowAny()]

    # def get_permissions(self):
    #     print(self.action)
    #     if self.action in ['list', 'create']:
    #         if isinstance(self.request.user, AnonymousUser):
    #             return [permissions.IsAuthenticated()]
    #         else:
    #             if(self.request.user.is_authenticated and (self.request.user.role in [User.RoleChoices.SELLER,
    #                                                                                   User.RoleChoices.EMPLOYEE,
    #                                                                                   User.RoleChoices.ADMIN]
    #                                                        or self.request.user.is_authenticated)):
    #                 return [permissions.IsAuthenticated()]
    #     return [permissions.AllowAny()]

    # if self.action in ['add_comment','like']:
    #     return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedProductDetailsSerializer

        return self.serializer_class

    @action(methods=['post'], url_path='commentss',detail=True)
    def add_comment(self, request,pk):
        #Comment.onject.create()
        c = self.get_object().comment_set.create(content = request.data.get("content"), user = request.user)

        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)


    @action(methods=['post'], url_path = 'like', detail=True)
    def like(self, request, pk):
        like,created = Like.objects.get_or_create(product = self.get_object(), user = request.user)
        if not created:
            like.active = not like.active
            like.save()
        return Response(serializers.ProductDetailsSerializer(self.get_object()).data)




class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView): #PermissionRequiredMixin
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    # permission_classes = [permissions.IsAuthenticated]

    #Xác thực User
    # def get_permissions(self):
    #     if self.action in ['create','update','partial_update', 'destroy']:
    #         if self.request.user.is_authenticated:
    #             return [permissions.IsAuthenticated()]
    #         else:
    #             return [permissions.AllowAny()]
    #     elif self.action in ['update', 'partial_update', 'destroy']:
    #         if self.request.user.is_authenticated and self.request.user.role in [self.RoleChoices.ADMIN,
    #                                                                              self.RoleChoices.EMPLOYEE]:
    #             return [permissions.IsAuthenticated()]
    #         else:
    #             return [permissions.IsAdminUser()]
    #             # raise exceptions.PermmissionDenied()
    #     return [permissions.AllowAny()]


    def get_permissions(self):
        if self.action.__eq__("get_current_user"):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]


    @action(methods=['get', 'patch'], url_path='current-user', detail=False) #detail = false là nó sẽ không gửi cái id về
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                setattr(user,k,v) #user.firt_name = v
            user.save()
        return Response(serializers.UserSerializer(user).data)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView,generics.ListAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_class = [permission.AccountOwnerAuthenticated]


class ReviewViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Reviews.objects.all()
    serializer_class = serializers.ReviewSerializer


class OrderViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView,generics.CreateAPIView,generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Orders.objects.all()
    serializer_class = serializers.OrderSerializer


class TagViewSet(viewsets.ViewSet, generics.ListAPIView,generics.CreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer



# class UserView(APIView):
#     authentication_classes = [BasicAuthentication,
#     TokenAuthentication]
#     permission_classes = [IsAdminUser]
#     def get(self, request):
#         pass
#
# class UserAPIView(APIView, viewsets.ViewSet, generics.GenericAPIView):
#
#     def get_user(self, request):
#         # Kiểm tra xem header Authorization có tồn tại không
#         if 'HTTP_AUTHORIZATION' in request.META:
#             auth_header = request.META['HTTP_AUTHORIZATION']
#             # Kiểm tra xem header Authorization có chứa Bearer token không
#             if auth_header.startswith('Bearer '):
#                 access_token = auth_header.split(' ')[1]
#                 # Thực hiện xác thực access_token ở đây
#                 # Nếu access_token hợp lệ, tiếp tục xử lý yêu cầu
#                 # Ví dụ: lấy đối tượng từ database và serialize nó
#                 user = User.objects.filter(active=True)
#                 serializer = serializers.UserSerializer(user)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#         # Nếu không có hoặc không hợp lệ, trả về lỗi 401 Unauthorized
#         return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)


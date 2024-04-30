from rest_framework import viewsets, generics, status, parsers, permissions, filters
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.mixins import PermissionRequiredMixin
from courses import serializers, paginators, permission
from courses.models import Category, Products, Orders, Reviews, User, Comment, Like, Shop
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.views.generic import ListView, DetailView


# class ShopListView(ListView):
#     query_set = Shop.objects.all().order_by('id')
#     templates_name = 'admin/stats.html'
#     context_object_name = 'Posts'
#     paginate_by = 10


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = serializers.CategorySerializer


class ShopViewSet(viewsets.ViewSet,generics.CreateAPIView, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Shop.objects.filter(active=True)
    serializer_class = serializers.ShopSerializer
    # pagination_class = paginators.ProductPaginator

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

    # def get_comment(self, request):
    #     queryset =self.queryset
    #     comment_id = self.request.query_params.get('id')
    #     if comment_id:
    #         queryset = queryset.filter(comment_id=comment_id)
    #
    #     return queryset

    @action(methods=['get'], url_path='comments', detail=True)
    def get_comments(self, request, pk):
        comments = self.get_object().comment_set.order_by('-id')
        q = request.query_params.get('q')
        if q:
            comments = comments.filter(content__icontains=q)

        #Phân trang cho comment
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data,
                        status=status.HTTP_200_OK)

    def get_permissions(self):
        if self.action in ['add_comment','like']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.AuthenticatedProductDetailsSerializer

        return self.serializer_class

    @action(methods=['post'], url_path='comments',detail=True)
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




class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, PermissionRequiredMixin):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]
    permission_classes = [permissions.IsAuthenticated]

    #Xác thực User
    def get_permissions(self):
        if self.action in ['get_current_user']:
            return [perms.AccountOwnerAuthenticated()]
        elif self.action in ['register_user']:
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

    @action(methods=['post'], url_path='register', detail=False)
    def register_user(self, request):
        try:
            data = request.data
            avatar = request.data.get("avatar")
            new_avatar = cloudinary.uploader.upload(data.get('avatar'), folder='SaleApp_user/')

            new_user = User.objects.create_user(
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                username=data.get("username"),
                email=data.get("email"),
                password=data.get("password"),
                avatar=new_avatar['secure_url'],
            )
            # Xác định vai trò dựa trên dữ liệu được cung cấp
            role_name = data.get('role')
            if role_name:
                try:
                    role = UserRole.objects.get(role = role_name)
                    new_user.role = role
                    new_user.save()
                    return Response(data=serializers.UserSerializer(new_user, context={'request': request}).data,
                                     status=status.HTTP_201_CREATED)
                except UserRole.DoesNotExist:
                    error_message = f"Role '{role_name}' does not exist."
                    return JsonResponse({"error": error_message}, status=status.HTTP_400_Bad_Request)
        except Exception as e:
            return Response(dict(error=e.__str__()), status=status.HTTP_403_FORBIDDEN)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_class = [permission.AccountOwnerAuthenticated]


class ReviewViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Reviews.objects.all()
    serializer_class = serializers.ReviewSerializer


class OrderViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Orders.objects.all()
    serializer_class = serializers.OrderSerializer




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


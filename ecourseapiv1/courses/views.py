from rest_framework import viewsets, generics, status, parsers, permissions, filters
from rest_framework.authentication import BasicAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.response import Response as ResponseRest
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




class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
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


class ProductViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView,generics.CreateAPIView, generics.DestroyAPIView, generics.UpdateAPIView):
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

            gender = self.request.query_params.get('gender', None)
            if gender:
                queryset = queryset.filter(gender=gender)

            shop_id = self.request.query_params.get('shop_id')
            if shop_id:
                queryset = queryset.filter(shop_id=shop_id)

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
        comments = self.get_object().comment_set.select_related('user').order_by('-id')

        #Phân trang cho comment
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)

    def get_permissions(self):
        if self.action in ['add_comment', 'like']:
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

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
    def add_like(self, request, pk):
        like,created = Like.objects.get_or_create(product = self.get_object(), user = request.user)
        if not created:
            like.active = not like.active
            like.save()
        return Response(serializers.ProductDetailsSerializer(self.get_object()).data)

    @action(methods=['get'], url_path='likes', detail=True)
    def get_like(self, request, pk):
        product = self.get_object()
        likes = product.like_set.filter(active=True)
        q = request.query_params.get('q')
        if q:
            likes = likes.filter(id__icontains=q)
        return Response(serializers.LikeSerializer(likes, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['get'], url_path='reviews', detail=True)
    def get_review(self, request, pk):
        reviews = self.get_object().reviews_set.filter(active=True)
        q = request.query_params.get('q')
        if q:
            # Lọc sản phẩm dựa trên tên sản phẩm và loại bỏ những sản phẩm không khớp
            products = reviews.filter(id__icontains=q)

        return Response(serializers.ReviewSerializer(reviews, many=True).data,
                        status=status.HTTP_200_OK)




class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.UpdateAPIView, PermissionRequiredMixin):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    # permission_classes = [permissions.IsAuthenticated]



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


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView,generics.ListAPIView, generics.CreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_class = [permission.AccountOwnerAuthenticated]



class ReviewViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView):
    queryset = Reviews.objects.all()
    serializer_class = serializers.ReviewSerializer
    permission_class = [permission.AccountOwnerAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_date']
    ordering = ['-created_date']  # Sắp xếp giảm dần theo created_date

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')
            if q:
                # Lọc theo product_id
                queryset = queryset.filter(product_id=q)

        return queryset


class OrderViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView,generics.CreateAPIView,generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Orders.objects.all()
    serializer_class = serializers.OrderSerializer
    permission_classes = [permissions.AllowAny]

    # def get_permissions(self):
    #     if self.action in ['update_paid']:
    #         return [permissions.IsAuthenticated()]
    #
    #     return [permissions.AllowAny()]



    # @action(detail=True, methods=['patch'], url_path='upload_proof', url_name='upload_proof')
    # def upload_proof(self, request, pk):
    #     # user_id = request.user.id
    #     fee_id = self.get_object()
    #     print(fee_id)
    #     avatar_file = request.data.get('', None)
    #
    #     try:
    #         orderFee = get_object_or_404(Orders, id=fee_id)
    #         new_avatar = cloudinary.uploader.upload(avatar_file)
    #         orderFee.payment_proof = new_avatar['secure_url']
    #         orderFee.statusPayment = True
    #         orderFee.save()
    #     except Orders.DoesNotExist:
    #         return ResponseRest({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    #
    # @action(methods=['patch'], detail=True, url_path='update-paid')
    # def update_paid(self, request, pk=None):
    #     try:
    #         orderFee = self.get_object()
    #         orderFee.user_id = request.user.user_id
    #         orderFee.statusPayment = True
    #         orderFee.save()
    #         return ResponseRest({'message': 'Receipt paid successfully'}, status=status.HTTP_200_OK)
    #     except Exception as e:
    #         return ResponseRest(dict(error=e.__str__()), status=status.HTTP_400_BAD_REQUEST)


class TagViewSet(viewsets.ViewSet, generics.ListAPIView,generics.CreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = serializers.TagSerializer






import hmac
import hashlib
import json
import requests
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


# MOMO
class MomoViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], url_path='process', url_name='process_payment')
    @csrf_exempt
    def momo(self, request):
        request_data = request.data
        print(request_data)

        endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
        ipnUrl = ""

        accessKey = "F8BBA842ECF85"
        secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
        partnerCode = "MOMO"
        orderInfo = request_data.get('id')
        requestId = str(uuid.uuid4())
        amount = request_data.get('price')
        orderId = str(uuid.uuid4())
        # orderId = total.get('appointment_id')+total.get('user_id')+total.get('booking_date')


        print('orderInfo' + orderInfo )
        print(type(orderInfo))
        print('amount' + amount)
        print(type(amount))

        requestType = "captureWallet"
        extraData = ""
        redirectUrl = ""

        rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl \
                       + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode \
                       + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType

        h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()
        data = {
            'partnerCode': partnerCode,
            'partnerName': "Test",
            'storeId': "MomoTestStore",
            'requestId': requestId,
            'amount': amount,
            'orderId': orderId,
            'orderInfo': orderInfo,
            'redirectUrl': redirectUrl,
            'ipnUrl': ipnUrl,
            'lang': "vi",
            'extraData': extraData,
            'requestType': requestType,
            'signature': signature,
            'orderExpireTime': 10,
        }

        data = json.dumps(data)

        clen = len(data)
        response = requests.post(endpoint,
                                 data=data,
                                 headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})

        print(response.status_code)
        print(response.content)

        if response.status_code == 200:
            response_data = response.json()
            return JsonResponse({**response_data})
        else:
            return JsonResponse({'error': 'Invalid request method'})

    @action(detail=False, methods=['post'], url_path='momo_ipn')
    @csrf_exempt
    def momo_ipn(self, request):
        if request.method == 'POST':
            try:
                ipn_data = request.data  # Sử dụng request.data thay vì json.loads(request.data)
                order_info = ipn_data.get('orderInfo')
                result_code = ipn_data.get('resultCode')

                if result_code == 0:
                    try:
                        order_fee = Orders.objects.get(id=order_info)
                        order_fee.status = order_fee.EnumStatusFee.DONE
                        order_fee.save()
                        return JsonResponse({'message': 'Payment successful and status updated'}, status=200)
                    except Orders.DoesNotExist:
                        return JsonResponse({'error': 'Order not found'}, status=404)
                else:
                    return JsonResponse({'error': 'Payment failed'}, status=400)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        else:
            return JsonResponse({'error': 'Invalid request method'}, status=405)

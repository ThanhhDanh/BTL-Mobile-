from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField
from django_enum_choices.fields import EnumChoiceField
from enum import Enum
import cloudinary.uploader


class User(AbstractUser):
    avatar = CloudinaryField(null=True)
    address = models.CharField(max_length=255, null=False)  # Thêm trường địa chỉ

    class RoleChoices(models.TextChoices):
        USER = 'user', 'User'
        ADMIN = 'admin', 'Admin'
        EMPLOYEE = 'employee', 'Employee'
        SELLER = 'seller', 'Seller'

    role = models.CharField(max_length=50, choices=RoleChoices.choices, null=True)



class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class ItemBase(BaseModel):
    tags = models.ManyToManyField(Tag)

    class Meta:
        abstract = True

class Category(BaseModel):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Shop(ItemBase):
    name = models.CharField(max_length=100)
    image = CloudinaryField(null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shops')
    address = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='shop_set')

    def __str__(self):
        return self.name


class Products(ItemBase):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]

    name = models.CharField(max_length = 50)
    image = CloudinaryField(null=True)
    content = RichTextField()
    priceProduct = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    seller_id = models.ForeignKey(User, on_delete=models.CASCADE, null= True, blank=True)
    category_id = models.ForeignKey(Category, on_delete=models.CASCADE, null= True, blank=True)
    shop_id = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='product', null=True, blank=True)


    def __str__(self):
        return self.name





class Orders(ItemBase):
    PAYMENT_METHOD_CHOICES = [
        ('COD', 'Thanh toán khi nhận hàng'),
        ('MOMO', 'Ví điện tử Momo'),
        # Add other payment methods here
    ]

    STATUS_PAYMENT_CHOICES = [
        ('PENDING', 'Pending'),
        ('DENY', 'Deny'),
        ('DONE', 'Done'),
        # Add other status choices here
    ]

    # class EnumStatusFee(models.TextChoices):
    #     PENDING = 'Đang chờ xử lý', 'Đang xử lý'
    #     DENY = 'Không thể xử lý', 'Thất Bại'
    #     DONE = 'Đã đăng ký', 'Thành Công'

    payment_proof = CloudinaryField(null=True)
    paymentMethod = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    statusPayment = models.CharField(max_length=50, choices=STATUS_PAYMENT_CHOICES)
    quantity = models.IntegerField()
    totalPrice = models.IntegerField()
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Thêm trường discount
    orderStatus = models.CharField(max_length = 50)
    status = models.CharField(max_length=50)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    product_id = models.ForeignKey(Products, on_delete=models.CASCADE, null=True, blank=True)
    shop_id = models.ForeignKey(Shop, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f'Order #{self.id}'



class Interaction(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    # review = models.ForeignKey(Reviews, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user_id} - {self.product_id}'

    class Meta:
        abstract = True


class Comment(Interaction):
    content = models.CharField(max_length=255)

    def __str__(self):
        return self.content


class Like(Interaction):

    class Meta:
        unique_together = ('user', 'product')


class Reviews(ItemBase):
    rating = models.IntegerField()
    comment_id = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    product_id = models.ForeignKey(Products, on_delete=models.CASCADE, null=True, blank=True, related_name='reviews_set')

    def __str__(self):
        return f'Review #{self.id}'

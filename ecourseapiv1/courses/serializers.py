from rest_framework import serializers
from courses.models import Category, Products, Reviews, Orders, Tag, User, Comment, Shop



class ItemSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['image'] = instance.image.url

        return rep


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = '__all__'




class UserSerializer(serializers.ModelSerializer):
    # avatar = serializers.FileField(max_length=None, allow_empty_file=False, use_url=True)
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        print(instance)
        print(rep)
        if rep['avatar'] is not None:
            rep['avatar'] = instance.avatar.url

        return rep

    def create(self, validated_data):
        data = validated_data.copy()

        user = User(**data)
        user.set_password(data["password"])
        user.save()

        return user

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'avatar','address', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Comment
        fields = ['id','content','user','user_id','product_id','created_date']



class ReviewSerializer(serializers.ModelSerializer):
    comment_content = serializers.CharField(source='comment_id.content', read_only=True)
    class Meta:
        model = Reviews
        fields = ['id', 'rating', 'comment_id','comment_content', 'user_id', 'product_id']



class ProductSerializer(ItemSerializer):
    comment = CommentSerializer(read_only=True, many=True)
    reviews = ReviewSerializer(many=True,read_only=True, source='reviews_set')
    class Meta:
        model = Products
        fields = ['id', 'name', 'priceProduct' ,'image','gender', 'created_date', 'updated_date', 'category_id','shop_id','comment','reviews']


class ProductDetailsSerializer(ProductSerializer):
    tags = TagSerializer(many=True)

    class Meta:
        model = ProductSerializer.Meta.model
        fields = ProductSerializer.Meta.fields + ['content', 'tags']



class ShopSerializer(ItemSerializer):
    products = ProductSerializer(many=True, read_only=True, source='product')
    class Meta:
        model = Shop
        fields = ['id','name','image','owner','address','products']


class ShopDetailsSerializer(ShopSerializer):
    tags = TagSerializer(many=True)

    class Meta:
        model = ShopSerializer.Meta.model
        fields = ShopSerializer.Meta.fields + ['tags']


class CategorySerializer(serializers.ModelSerializer):
    shops = ShopSerializer(many=True, read_only=True, source='shop_set')
    class Meta:
        model = Category
        fields = ['id','name','created_date','updated_date','shops']





class AuthenticatedProductDetailsSerializer(ProductDetailsSerializer):
    liked = serializers.SerializerMethodField()

    def get_liked(self,product):
        return product.like_set.filter(active=True).exists()

    class Meta:
        model = ProductDetailsSerializer.Meta.model
        fields = ProductDetailsSerializer.Meta.fields + ['liked']
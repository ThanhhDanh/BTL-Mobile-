from rest_framework import pagination


class ProductPaginator(pagination.PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 100

class CommentPaginator(pagination.PageNumberPagination):
    page_size = 2

class ReviewPaginator(pagination.PageNumberPagination):
    page_size = 2
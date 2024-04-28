from rest_framework import permissions

# class CommentOwner(permissions.IsAuthenticated):
#     def has_object_permission(self, request, view, comment):
#         return  super().has_permission(request,view) and request.user == comment.user


class AccountOwnerAuthenticated(permissions.IsAuthenticated):
    message = 'Not your Account'

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view) and request.user == obj
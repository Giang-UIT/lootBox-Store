from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('htmlfile/', views.render_html, name='render_html'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/signup/', views.signup, name='signup'),
    #Cart
    path("api/cart/<int:account_id>/", views.get_cart),
    path("api/cart/add/", views.add_to_cart),
    path("api/cart/decrease/", views.decrease_from_cart),       
    path("api/cart/remove/", views.remove_from_cart),
    path("api/cart/checkout/", views.checkout),
    path('api/accounts/<int:account_id>/addresses/', views.address_list, name='address_list'),
    path('api/accounts/<int:account_id>/addresses/<int:address_id>/', views.address_detail, name='address_detail'),

    #Products
    path('api/products/', views.product_list, name='product_list'),
    path('api/products/<int:pk>/', views.product_detail, name='product_detail'),
]
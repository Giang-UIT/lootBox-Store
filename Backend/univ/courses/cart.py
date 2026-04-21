#Cart logic

from .models import Cart, CartItem

def get_or_create_cart(user):
    cart, created = Cart.objects.get_or_create(account=user, status='active')
    return cart

def get_active_cart(user):
    return Cart.objects.filter(account=user, status='active').first()

def add_product_to_cart(user, product, quantity=1):
    cart = get_or_create_cart(user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not created:
        item.item_quantity += quantity
    else:
        item.item_quantity = quantity
    item.save()

def decrease_product_from_cart(user, product, quantity=1):
    cart = get_active_cart(user)
    if not cart: return

    try:
        item = CartItem.objects.get(cart=cart, product=product)
        new_quantity = item.item_quantity - quantity
        if new_quantity > 0:
            item.item_quantity = new_quantity
            item.save()
        else:
            item.delete()
    except CartItem.DoesNotExist:
        pass

def remove_product_from_cart(user, product):
    cart = get_active_cart(user)
    if cart:
        CartItem.objects.filter(cart=cart, product=product).delete()

def set_quantity_of_a_product_in_a_cart(user, product, quantity):
    if quantity <= 0:
        remove_product_from_cart(user, product)
        return
    cart = get_or_create_cart(user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    item.item_quantity = quantity
    item.save()

def update_status(user, status):
    cart = get_or_create_cart(user)
    cart.status = status
    cart.save()
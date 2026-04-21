from .models import Product

def create_product(name, description, price, stock, origin, image=None):
    product = Product(name=name, description=description, price=price, stock_quantity=stock, origin_country=origin, image=image)
    product.save()
    return product

def get_product_by_id(product_id):
    try:
        return Product.objects.get(id = product_id)
    except Product.DoesNotExist:
        return None
    
def get_all_products():
    return Product.objects.all()

def update_product_name(product_id, new_name):
    try:
        product = Product.objects.get(id = product_id)
        product.name = new_name
        product.save()
        return product
    except Product.DoesNotExist:
        return None

def update_product_description(product_id, new_description):
    try:
        product = Product.objects.get(id = product_id)
        product.description = new_description
        product.save()
        return product
    except Product.DoesNotExist:
        return None
    
def update_product_price(product_id, new_price):
    try:
        product = Product.objects.get(id = product_id)
        product.price = new_price
        product.save()
        return product
    except Product.DoesNotExist:
        return None

def update_product_stock(product_id, new_stock):
    try:
        product = Product.objects.get(id = product_id)
        product.stock_quantity = new_stock
        product.save()
        return product
    except Product.DoesNotExist:
        return None
    
def update_product_country(product_id, new_country):
    try:
        product = Product.objects.get(id = product_id)
        product.origin_country = new_country
        product.save()
        return product
    except Product.DoesNotExist:
        return None

def update_product_image(product_id, new_image):
    try:
        product = Product.objects.get(id=product_id)
        product.image = new_image
        product.save()
        return product
    except Product.DoesNotExist:
        return None
    
def delete_product(product_id):
    try:
        product = Product.objects.get(id = product_id)
        product.delete()
        return True
    except Product.DoesNotExist:
        return False
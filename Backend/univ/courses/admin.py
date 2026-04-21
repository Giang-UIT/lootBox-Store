from django.db import IntegrityError

from .account import (
    create_account, get_account_by_id,
    update_account_name, update_account_email, update_account_password,
    update_account_admin_status, delete_account
)

from .product import (
    create_product, update_product_name, update_product_description,
    update_product_price, update_product_stock, update_product_country,
    update_product_image, delete_product
)


def is_admin(account_id):
    acc = get_account_by_id(account_id)
    if acc:
        return acc.admin_status
    return False


def admin_create_product(account_id, name, description, price, stock, origin, image):
    if not is_admin(account_id):
        raise PermissionError("Only admins can create products.")
    return create_product(name, description, price, stock, origin, image)


def admin_update_product(
    account_id,
    product_id,
    name=None,
    description=None,
    price=None,
    stock=None,
    origin=None,
    image=None,
):
    if not is_admin(account_id):
        raise PermissionError("Only admins can update products.")
    updated = False
    if name is not None:
        update_product_name(product_id, name)
        updated = True
    if description is not None:
        update_product_description(product_id, description)
        updated = True
    if price is not None:
        update_product_price(product_id, price)
        updated = True
    if stock is not None:
        update_product_stock(product_id, stock)
        updated = True
    if origin is not None:
        update_product_country(product_id, origin)
        updated = True
    if image is not None:
        update_product_image(product_id, image)
        updated = True
    return updated


def admin_delete_product(account_id, product_id):
    if not is_admin(account_id):
        raise PermissionError("Only admins can delete products.")
    try:
        return delete_product(product_id)
    except IntegrityError:
        raise ValueError("Cannot delete product because it is referenced by carts/orders.")


def admin_create_account(account_id, name, password, email, admin_status=False):
    if not is_admin(account_id):
        raise PermissionError("Only admins can create accounts.")
    return create_account(name, password, email, admin_status)


def admin_update_account(account_id, target_account_id, name=None, email=None, password=None, admin_status=None):
    if not is_admin(account_id):
        raise PermissionError("Only admins can update accounts.")
    updated = False
    if name is not None:
        update_account_name(target_account_id, name)
        updated = True
    if email is not None:
        update_account_email(target_account_id, email)
        updated = True
    if password is not None:
        update_account_password(target_account_id, password)
        updated = True
    if admin_status is not None:
        update_account_admin_status(target_account_id, admin_status)
        updated = True
    return updated


def admin_delete_account(account_id, target_account_id):
    if not is_admin(account_id):
        raise PermissionError("Only admins can delete accounts.")
    if account_id == target_account_id:
        raise PermissionError("You cannot delete your own account.")
    return delete_account(target_account_id)
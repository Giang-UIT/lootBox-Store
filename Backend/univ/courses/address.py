from .models import Address

def create_address(account, phone_number, line1, line2, city, state, postal_code, country):
    address = Address.objects.create(
        account=account,
        phone_number=phone_number,
        line1=line1,
        line2=line2,
        city=city,
        state=state,
        postal_code=postal_code,
        country=country
    )
    return address

def get_addresses_for_account(account):
    return Address.objects.filter(account=account)

def update_address(address_id, phone_number=None, line1=None, line2=None, city=None, state=None, postal_code=None, country=None):
    try:
        address = Address.objects.get(id=address_id)
        if phone_number is not None: address.phone_number = phone_number
        if line1 is not None: address.line1 = line1
        if line2 is not None: address.line2 = line2
        if city is not None: address.city = city
        if state is not None: address.state = state
        if postal_code is not None: address.postal_code = postal_code
        if country is not None: address.country = country
        address.save()
        return address
    except Address.DoesNotExist:
        return None
    
def delete_address(address_id):
    try:
        address = Address.objects.get(id=address_id)
        address.delete()
        return True
    except Address.DoesNotExist:
        return False
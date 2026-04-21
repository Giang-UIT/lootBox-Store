from .models import Account, Session
import secrets
from django.utils import timezone
from datetime import timedelta

def create_account(name, password, email, admin_status=False):
    account = Account(name=name, password=password, email=email, admin_status=admin_status)
    account.save()
    return account

def get_account_by_id(account_id):
    try:
        return Account.objects.get(id=account_id)
    except Account.DoesNotExist:
        return None

def get_account_by_email(email):
    try:
        return Account.objects.get(email=email)
    except Account.DoesNotExist:
        return None
    
def get_all_accounts():
    return Account.objects.all()
    
def update_account_name(account_id, new_name):
    try:
        account = Account.objects.get(id=account_id)
        account.name = new_name
        account.save()
        return account
    except Account.DoesNotExist:
        return None

def update_account_email(account_id, new_email):
    try:
        account = Account.objects.get(id=account_id)
        account.email = new_email
        account.save()
        return account
    except Account.DoesNotExist:
        return None
    
def update_account_password(account_id, new_password):
    try:
        account = Account.objects.get(id=account_id)
        account.password = new_password
        account.save()
        return account
    except Account.DoesNotExist:
        return None
    
def update_account_admin_status(account_id, new_status):
    try:
        account = Account.objects.get(id=account_id)
        account.admin_status = new_status
        account.save()
        return account
    except Account.DoesNotExist:
        return None
    
def delete_account(account_id):
    try:
        account = Account.objects.get(id=account_id)
        account.delete()
        return True
    except Account.DoesNotExist:
        return False

def delete_account_by_email(email):
    try:
        account = Account.objects.get(email=email)
        account.delete()
        return True
    except Account.DoesNotExist:
        return False

#Authentiaction service functions
#Creates sessions with session tokens and account information
def create_session(acct):
    token = secrets.token_hex(32)  # 64-char random string
    expires = timezone.now() + timedelta(hours=24) #sets token expiration
    session = Session.objects.create(account=acct, token=token, expires_at=expires)
    return session

def validate_session(token):
    #Return the account if the token is valid and not expired, else None
    try:
        session = Session.objects.get(token=token)
        if session.is_expired():
            session.delete()
            return None
        return session.account
    except Session.DoesNotExist:
        return None

def delete_session(token):
    #Log out — delete the session
    Session.objects.filter(token=token).delete()
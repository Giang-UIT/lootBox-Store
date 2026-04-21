from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Account


class SignUpForm(forms.ModelForm):
    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(max_length=100, help_text='Required. Inform a valid email address.')
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = Account
        fields = ('name', 'email', 'password')

class LoginForm(forms.Form):
    email = forms.EmailField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = Account
        fields = ('email', 'password')
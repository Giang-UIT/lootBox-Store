from django.db import models #the ORM

# Create your models here.

class Department(models.Model): #table department
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Course(models.Model): #table course
    dept = models.ForeignKey(Department, on_delete=models.CASCADE) #attibute = dept (foreign key of Department table)
    title = models.CharField(max_length=100) #attribute2(char with the length of 100 chars)

    def __str__(self): #This is needed for printing objects/rows of this table 
        return self.title

class Account(models.Model): #table account
    name = models.CharField(max_length=100, blank=False)
    password = models.CharField(max_length=100, blank=False)
    email = models.CharField(max_length=100, unique=True)
    admin_status = models.BooleanField(default=False)
    time_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    name = models.CharField(max_length=100, blank=False)
    description = models.TextField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    stock_quantity = models.PositiveIntegerField(default=0)
    origin_country = models.CharField(max_length=100, blank=False)
    time_created = models.DateTimeField(auto_now_add=True)
    image = models.URLField(blank=True)

    def __str__(self):
        return self.name

class Cart(models.Model):
    account = models.ForeignKey("courses.Account", on_delete=models.CASCADE)

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('checked_out', 'Checked Out'),
        ('abandoned', 'Abandoned'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    time_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart {self.id} for {self.account.name}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.RESTRICT)
    item_quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = ('cart', 'product')

    def __str__(self): return f"{self.product.name} ({self.item_quantity})"

class Address(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, null=False, blank=False)
    line1 = models.CharField(max_length=255, null=False, blank=False)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, null=False, blank=False)
    state = models.CharField(max_length=100, null=False, blank=False)
    postal_code = models.CharField(max_length=20, null=False, blank=False)
    country = models.CharField(max_length=100, null=False, blank=False)

    def __str__(self):
        return f"{self.line1}, {self.city}, {self.country}"

#Session model for storing valid login sessions

class Session(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f"Session for {self.account.name} (expires {self.expires_at})"

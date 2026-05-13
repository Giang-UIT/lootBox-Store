# Backend — Loot Box Store

Django REST API backend for the Loot Box Store application.

## Structure

```text
univ/
    ├── courses/          # Main Django app
    │   ├── models.py     # Database models
    │   ├── views.py      # API endpoints
    │   ├── urls.py       # URL routing
    │   ├── account.py    # Account service layer
    │   ├── cart.py       # Cart service layer
    │   ├── product.py    # Product service layer
    │   ├── address.py    # Address service layer
    │   ├── tests/        # Backend tests
    │   └── migrations/   # Database migrations
    └── univ/             # Django project settings
```

## Setup

1. Create and activate a virtual environment:
```bash
python3 -m venv ~/.virtualenvs/lootbox
source ~/.virtualenvs/lootbox/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. (Optional) Populate with sample data:
```bash
sqlite3 db.sqlite3 < pop.sql
```

5. Start the server:
```bash
python manage.py runserver
```

## Testing

```bash
python manage.py test
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login/` | Log in |
| POST | `/api/signup/` | Create account |
| POST | `/api/logout/` | Log out |
| GET | `/api/products/` | List all products |
| GET | `/api/products/<id>/` | Get product |
| PATCH | `/api/products/<id>/` | Update product (admin) |
| DELETE | `/api/products/<id>/` | Delete product (admin) |
| GET | `/api/cart/<account_id>/` | Get cart |
| POST | `/api/cart/add/` | Add to cart |
| POST | `/api/cart/decrease/` | Decrease quantity |
| POST | `/api/cart/remove/` | Remove from cart |
| POST | `/api/cart/checkout/` | Check out |
| GET | `/api/accounts/<id>/addresses/` | List addresses |
| POST | `/api/accounts/<id>/addresses/` | Add address |
| PUT | `/api/accounts/<id>/addresses/<id>/` | Update address |
| DELETE | `/api/accounts/<id>/addresses/<id>/` | Delete address |
| GET | `/api/getUser/` | List all accounts (admin) |
| DELETE | `/api/deleteUser/<id>/` | Delete account (admin) |
| PUT | `/api/editAccount/` | Edit account (admin) |

## Acknowledgements

Based on the Django template provided by Professor Weihai Yu.
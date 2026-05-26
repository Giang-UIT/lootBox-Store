PRAGMA foreign_keys = ON;

--table for products, includes id, name, price of the product, product description,
--amount in stock, origin country of the product and when the product was created in the database
CREATE TABLE products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    description     TEXT,    
    price           INTEGER NOT NULL,
    stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    origin_country  TEXT NOT NULL,
    time_created    TEXT NOT NULL DEFAULT (datetime('now'))

);

-- table for accounts, includes id, name of the accountholder, their password (only plainfile text right now, will get changed to hash later)
-- their email, only one account per email, their admin status (value 0 if they are not an admin, 1 if they are an admin) and the time the account was created
CREATE TABLE accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,   
    name            TEXT NOT NULL,
    password        TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    admin_status    INTEGER NOT NULL DEFAULT 0 CHECK (admin_status IN (0,1)), 
    time_created    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- table for carts, includes id, the account id the cart is connected to, the status of the cart, and when it was created
-- references a foreign key in the account id, if the account is deleted the rows that reference it is deleted
-- includes the status of the carts, defaults on the cart being active, but also checks if it is checked out or abandoned
CREATE TABLE carts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'checked_out', 'abandoned')),
    time_created    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- table for items in the cart, includes item quantity and the price, references foreign keys in the cart_id and product id, deletes rows related to 
-- the cart id, rejects deletion of rows referrencing the product id
CREATE TABLE cart_items (
    cart_id         INTEGER NOT NULL,  
    product_id      INTEGER NOT NULL,  
    item_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (item_quantity >= 0), 
    PRIMARY KEY (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE

);

-- table for orders, includes the order id, account id, cart id, the status, set defaulty to placed but checks for paid and cancelled
-- includes when the order was created and references account id and cart id as foreign ids, restricts delete on cart id, and deletes rows when 
-- account id is deleted
CREATE TABLE orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL,
    cart_id         INTEGER NOT NULL,
    address_id      INTEGER,NOT NULL
    status          TEXT NOT NULL DEFAULT 'placed'
                CHECK (status IN ('placed', 'paid', 'cancelled')),
    time_created    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE
);

-- table for items in the order, includes the order id and product id and the quantity of items, references foreign keys for id's from orders and products
-- when order ids are deleted it deletes rows referencing, restricts deletion of rows refering the products.
CREATE TABLE order_items (
    order_id        INTEGER NOT NULL,   
    product_id      INTEGER NOT NULL,
    stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- table for addresses, includes the address id, account id, street, city, postal code, country and references the account id as a foreign key, deletes rows referencing the account id when it is deleted
CREATE TABLE addresses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone_number    TEXT NOT NULL,
    account_id      INTEGER NOT NULL,
    street          TEXT NOT NULL,
    city            TEXT NOT NULL,
    pstate          TEXT NOT NULL,
    postal_code     CHAR NOT NULL,
    country         TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- table for the connection between orders and addresses, includes order id and address id, references foreign keys for both, deletes rows referencing the order id when it is deleted, deletes rows referencing the address id when it is deleted
CREATE TABLE address_order (
    order_id        INTEGER NOT NULL,
    address_id      INTEGER NOT NULL,
    PRIMARY KEY (order_id, address_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
);
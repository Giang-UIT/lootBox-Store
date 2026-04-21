# Web design

```mermaid

    flowchart TD
    mp --> pd{products display} & login 
    pd --> pinf(product information)
    login -->  s(sign up)
    login & s --> |if logged in| cart
    login & s --> |if admin| ap(admin page)
    cart --> add(address page)
    ap --> accm(accounts manager) & pman(products manager)
    pman --> edi(product editing)

```
To see the diagram in VS Code install the extension _Markdown Preview Mermaid Support_

![board picture](eStoreWebDesign.jpg)

- product display
    - search
    - grid display
        - future if we have time, choose between grid and list (with description)
- product information
    - pic
    - name
    - description
    - …
    - add to cart
- product editing
    - product information: not same page
    - no add to cart button
    - edit button
    - delete button
- account manager
    - “search bar”: email, redirects to that page count page
    - edit account button
    - all accounts display as list
- navbar
    - admin
        | products manager | accounts manager | sign out |
        | --- | --- | --- |
    - user
        
        | products | 🛒 | sign out |
        | --- | --- | --- |
    - logged out
        
        | products | log in |
        | --- | --- |
        
        cart button redirects to sign in
        
- log in page, can change to sign in
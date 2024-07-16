let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

const addDataToHTML = () => {
    // remove datas default from HTML

    // add new datas
    if (products.length > 0) // if has data
    {
        products.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.dataset.id = product.id;
            newProduct.classList.add('item');
            newProduct.innerHTML =
                `<img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <div class="kg" data-available-kg="${product.kg}">Available Kg: ${product.kg}</div>
                <button class="addCart">Add To Cart</button>`;
            listProductHTML.appendChild(newProduct);
        });
    }
};

listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let id_product = positionClick.parentElement.dataset.id;
        addToCart(id_product);
    }
});


// Add this block for fetching data
listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let product_id = positionClick.parentElement.dataset.id;
        let quantity = 1;  // You can modify this based on your requirements

        // Make a request to the backend to add the product to the cart
        fetch(`/api/addToCart/${product_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to add to cart: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message); // Log success message
            // You may want to update the UI or perform other actions here
        })
        .catch(error => {
            console.error(error); // Log and handle any errors
        });
    }
});

// ... (other existing functions)








const updateProductKg = (product_id, newKg) => {
    let positionProduct = products.findIndex((value) => value.id == product_id);
    if (positionProduct >= 0) {
        products[positionProduct].kg = newKg;
    }
};

const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if (cart.length <= 0) {
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    } else if (positionThisProductInCart < 0) {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }

    // Decrease the available kilograms based on the quantity
    let positionProduct = products.findIndex((value) => value.id == product_id);
    if (positionProduct >= 0) {
        const quantity = cart[positionThisProductInCart].quantity;
        const availableKg = products[positionProduct].kg - quantity;

        // Update the available kilograms in the frontend
        updateAvailableKg(product_id, availableKg);
    }

    addCartToHTML();
    addCartToMemory();
    addDataToHTML(); // Update the displayed product information after adding to the cart
};

const updateAvailableKg = (product_id, availableKg) => {
    let positionProduct = products.findIndex((value) => value.id == product_id);
    if (positionProduct >= 0) {
        products[positionProduct].kg = availableKg;
        // Update the displayed available kilograms in the product list
        let productElement = document.querySelector(`.item[data-id="${product_id}"] .kg`);
        productElement.innerHTML = `Available Kg: ${availableKg}`;
        productElement.dataset.availableKg = availableKg;
    }
};

const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        let info = cart[positionItemInCart];
        let positionProduct = products.findIndex((value) => value.id == product_id);
        if (positionProduct >= 0) {
            switch (type) {
                case 'plus':
                    cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                    products[positionProduct].kg = products[positionProduct].kg - 1;
                    break;

                default:
                    let changeQuantity = cart[positionItemInCart].quantity - 1;
                    if (changeQuantity > 0) {
                        cart[positionItemInCart].quantity = changeQuantity;
                        products[positionProduct].kg = products[positionProduct].kg + 1;
                    } else {
                        cart.splice(positionItemInCart, 1);
                        products[positionProduct].kg = products[positionProduct].kg + info.quantity;
                    }
                    break;
            }

            // Update the displayed available kilograms in the product list
            updateAvailableKg(product_id, products[positionProduct].kg);
        }
    }
    addCartToHTML();
    addCartToMemory();
};

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalPrice = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            let itemPrice = info.price * item.quantity;
            totalPrice += itemPrice;
            newItem.innerHTML = `
            <div class="image">
                <img src="${info.image}">
            </div>
            <div class="name">
                ${info.name}
            </div>
            <div class="totalPrice">$${itemPrice.toFixed(2)}</div>
            <div class="quantity">
                <span class="minus"><</span>
                <span>${item.quantity}</span>
                <span class="plus">></span>
            </div>
            
            `;
        });
        // Display total price in HTML
        listCartHTML.innerHTML += `<div class="total">Total: $${totalPrice.toFixed(2)}</div>`;
    }
    iconCartSpan.innerText = totalQuantity;
};

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus')) {
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
});

const initApp = () => {
    // get data product
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            // get data cart from memory
            if (localStorage.getItem('cart')) {
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        });
};

initApp();

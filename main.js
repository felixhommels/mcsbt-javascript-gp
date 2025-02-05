document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const category = event.target.textContent;
      filterProducts(category);
    });
  });

  document
    .getElementById("clear-filter")
    .addEventListener("click", clearFilter);

  document
    .querySelector("#category-container input[type='text']")
    .addEventListener("input", searchProducts);
});

let allProducts = [];

fetch("inventory.json")
  .then((response) => response.json())
  .then((data) => {
    allProducts = data;
    displayProducts(allProducts);
  })
  .catch((error) => console.error("Error fetching inventory:", error));

function displayProducts(products) {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";
  let row;

  products.forEach((item, index) => {
    if (index % 3 === 0) {
      row = document.createElement("div");
      row.className = "row";
      productContainer.appendChild(row);
    }

    const card = document.createElement("div");
    card.className = "col-4";
    card.innerHTML = `
      <div class="card">
        <img src="${item.image}" class="card-img-top" alt="${item.name}">
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          <p class="card-text">${item.description}</p>
          <p class="card-price">${item.price}</p>
          <input type="number" min="1" value="1" class="quantity-input" />
          <button class="btn btn-primary add-to-cart" data-id="${item.id}">Add to Cart</button>
        </div>
      </div>
    `;
    row.appendChild(card);

    card.querySelector(".add-to-cart").addEventListener("click", (event) => {
      const quantity = card.querySelector(".quantity-input").value;
      addToCart(item.id, quantity);
    });
  });
}

function filterProducts(category) {
  const filteredProducts = allProducts.filter(
    (product) => product.category === category
  );
  displayProducts(filteredProducts);
}

function clearFilter() {
  displayProducts(allProducts);
}

//Functionality doesnt quite work yet
function searchProducts() {
  const searchInput = document.querySelector(
    "#category-container input[type='text']"
  ).value;
  const searchedProducts = allProducts.filter(
    (product) =>
      product.name.includes(searchInput) ||
      product.description.includes(searchInput)
  );
  displayProducts(searchedProducts);
}

let cart = [];

function addToCart(productId, quantity) {
  const product = allProducts.find((item) => item.id === productId);
  if (product) {
    const existingProduct = cart.find((item) => item.id === productId);
    if (existingProduct) {
      existingProduct.quantity += parseInt(quantity);
    } else {
      cart.push({
        ...product,
        quantity: parseInt(quantity),
      });
    }
    updateCart();
  }
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const totalElement = document.getElementById("total");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItem = document.createElement("li");
    cartItem.innerHTML = `${item.name} x${item.quantity} - <strong>${item.price}</strong> <button class="remove-item btn btn-danger" data-id="${item.id}">Remove</button>`;
    cartItems.appendChild(cartItem);

    cartItem.querySelector(".remove-item").addEventListener("click", () => {
      removeFromCart(item.id);
    });

    total += parseFloat(item.price.replace("$", "")) * item.quantity;
  });

  totalElement.textContent = `Total: $${total.toFixed(2)}`;
}

function removeFromCart(productId) {
  const product = cart.find((item) => item.id === productId);
  if (product) {
    if (product.quantity > 1) {
      product.quantity -= 1;
    } else {
      cart = cart.filter((item) => item.id !== productId);
    }
    updateCart();
  }
}

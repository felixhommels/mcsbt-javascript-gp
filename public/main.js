document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      const category = event.target.innerText;
      filterProducts(category);
    });
  });

  document
    .getElementById("clear-filter")
    .addEventListener("click", clearFilter);

  document
    .querySelector('form[role="search"] input[type="search"]')
    .addEventListener("input", searchProducts);

  loadCart();
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

  products.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "col-12 col-sm-6 col-md-4 item my-2";
    card.innerHTML = `
      <div class="card">
        <a href="${item.image}" data-toggle="lightbox">
        <img src="${item.image}" class="card-img-top" alt="${item.name}">
        </a>
        <div class="card-body">
          <h5 class="card-title">${item.name}</h5>
          <p class="card-text">${item.description}</p>
          <p class="card-price">${item.price}</p>
        </div>
        <div class = "card-footer">
          <div class="d-flex align-">
            <input type="number" min="1" value="1" class="form-control quantity-input" style="width: 80px; margin-right: 10px;" aria-label="Quantity"/>
            <button class="btn btn-danger add-to-cart ms-auto" type="button" data-id="${item.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    productContainer.appendChild(card);

    card.querySelector(".add-to-cart").addEventListener("click", (event) => {
      const quantity = card.querySelector(".quantity-input").value;
      addToCart(item.id, quantity);
    });
  });
  document.querySelectorAll('a[data-toggle="lightbox"]').forEach(el => el.addEventListener('click', Lightbox.initialize));
  const grid = document.getElementById("product-container");
  const msnry = new Masonry(grid, {
    itemSelector: ".item",
    percentPosition: true
  });

  imagesLoaded(grid, function () {
    msnry.layout();
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

function searchProducts() {
  const searchInput = document.querySelector('form[role="search"] input[type="search"]').value.toLowerCase();
  const searchedProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchInput) ||
      product.description.toLowerCase().includes(searchInput)
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
    saveCart();
    const offcanvasElement = document.getElementById("offcanvasRight");
    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();

  }
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const totalElement = document.getElementById("total");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItem = document.createElement("li");
    cartItem.innerHTML = `${item.name} x${item.quantity} - <strong>${item.price}</strong> <button class="remove-item btn btn-outline-danger" data-id="${item.id}">🗑️</button>`;
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
    saveCart();
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCart();
      console.log("Cart loaded:", cart);
    } catch (error) {
      console.error("Error parsing cart:", error);
    }
  }
}

document.getElementById("checkout-button").addEventListener("click", () => {
  const receiptBody = document.getElementById("receipt-body");
  receiptBody.innerHTML = ""; // Clear previous content

  if (cart.length === 0) {
    receiptBody.innerHTML = "<p>Your cart is empty!</p>";
  } else {
    let total = 0;
    cart.forEach(item => {
      const itemTotal = parseFloat(item.price.replace("$", "")) * item.quantity;
      total += itemTotal;
      const itemLine = document.createElement("p");
      itemLine.textContent = `${item.name} x ${item.quantity} = $${itemTotal.toFixed(2)}`;
      receiptBody.appendChild(itemLine);
    });
    const totalLine = document.createElement("p");
    totalLine.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    receiptBody.appendChild(totalLine);
  }

  // Show the modal using Bootstrap's modal API
  const receiptModal = new bootstrap.Modal(document.getElementById("receiptModal"));
  receiptModal.show();
});

document.getElementById("print-button").addEventListener("click", () => {
  const receiptContent = document.getElementById("receipt-body").innerHTML;
  const printWindow = window.open("", "", "width=600,height=400");
  printWindow.document.write("<html><head><title>Receipt</title>");
  printWindow.document.write("<link rel='stylesheet' href='style.css'>");
  printWindow.document.write("</head><body>");
  printWindow.document.write("<h3>Receipt</h1>");
  printWindow.document.write(receiptContent);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();
  printWindow.focus();
});

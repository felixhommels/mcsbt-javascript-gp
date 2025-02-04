// Fetch data from inventory.json
fetch("inventory.json")
  .then((response) => response.json())
  .then((data) => {
    const productContainer = document.getElementById("product-container");
    let row;

    data.forEach((item, index) => {
      // Create a new row every 3 items
      if (index % 3 === 0) {
        row = document.createElement("div");
        row.className = "row";
        productContainer.appendChild(row);
      }

      // Create a card for each item
      const card = document.createElement("div");
      card.className = "col-4"; // Adjust column size as needed
      card.innerHTML = `
        <div class="card">
          <img src="${item.image}" class="card-img-top" alt="${item.name}">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">${item.description}</p>
            <p class="card-price">${item.price}</p>
            <button class="btn btn-primary">Add to Cart</button>
          </div>
        </div>
      `;
      row.appendChild(card);
    });
  })
  .catch((error) => console.error("Error fetching inventory:", error));

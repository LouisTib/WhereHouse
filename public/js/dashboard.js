document.addEventListener("DOMContentLoaded", function () {
    const createBtn = document.getElementById("createWarehouseBtn");
    const warehouseInput = document.getElementById("warehouseName");
    const myWarehousesList = document.getElementById("myWarehouses");
    const sharedWarehousesList = document.getElementById("sharedWarehouses");
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    // Function to create and append a warehouse box with a delete button
    function addWarehouseBox(warehouse, isOwned = true) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("warehouse-icon");
        newDiv.dataset.id = warehouse.id;

        // Add warehouse name to the box using <a> tag for routing
        const warehouseLink = document.createElement("a");
        warehouseLink.classList.add("warehouse-name");
        warehouseLink.href = `/warehouses/${warehouse.id}`;
        warehouseLink.textContent = warehouse.warehouse_name;
        newDiv.appendChild(warehouseLink);

        // Only show delete button for owned warehouses
        if (isOwned) {
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-warehouse-btn");
            deleteBtn.textContent = "×";
            deleteBtn.dataset.id = warehouse.id;
            deleteBtn.setAttribute("aria-label", "Delete warehouse");
            newDiv.appendChild(deleteBtn);
        } else {
            // Add shared indicator
            newDiv.classList.add("shared");
        }

        // Add staggered animation
        newDiv.style.animation = `slideInUp 0.4s ease-out forwards`;
        newDiv.style.opacity = "0";

        return newDiv;
    }

    // Load existing warehouses via AJAX
    function loadWarehouses() {
        fetch("/warehouses", {
            headers: {
                Accept: "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.warehouses) {
                    // Clear both lists
                    myWarehousesList.innerHTML = "";
                    sharedWarehousesList.innerHTML = "";

                    // Get current user ID (we'll need to fetch this)
                    fetch("/api/user")
                        .then((res) => res.json())
                        .then((userData) => {
                            const currentUserId = userData.id;

                            // Separate owned vs shared warehouses
                            const ownedWarehouses = [];
                            const sharedWarehouses = [];

                            data.warehouses.forEach((warehouse) => {
                                // Check if user is the creator
                                if (warehouse.user_id === currentUserId) {
                                    ownedWarehouses.push(warehouse);
                                } else {
                                    sharedWarehouses.push(warehouse);
                                }
                            });

                            // Add owned warehouses
                            if (ownedWarehouses.length > 0) {
                                ownedWarehouses.forEach((warehouse, index) => {
                                    const warehouseBox = addWarehouseBox(
                                        warehouse,
                                        true,
                                    );
                                    warehouseBox.style.animationDelay = `${index * 0.05}s`;
                                    myWarehousesList.appendChild(warehouseBox);
                                });
                            } else {
                                myWarehousesList.innerHTML =
                                    '<p class="no-warehouses">No warehouses yet. Create one to get started!</p>';
                            }

                            // Add shared warehouses
                            if (sharedWarehouses.length > 0) {
                                sharedWarehouses.forEach((warehouse, index) => {
                                    const warehouseBox = addWarehouseBox(
                                        warehouse,
                                        false,
                                    );
                                    warehouseBox.style.animationDelay = `${index * 0.05}s`;
                                    sharedWarehousesList.appendChild(
                                        warehouseBox,
                                    );
                                });
                            } else {
                                sharedWarehousesList.innerHTML =
                                    '<p class="no-warehouses">No shared warehouses</p>';
                            }
                        })
                        .catch((error) => {
                            console.error("Error getting user data:", error);
                            // Fallback: show all warehouses in "My Warehouses"
                            data.warehouses.forEach((warehouse, index) => {
                                const warehouseBox = addWarehouseBox(
                                    warehouse,
                                    true,
                                );
                                warehouseBox.style.animationDelay = `${index * 0.05}s`;
                                myWarehousesList.appendChild(warehouseBox);
                            });
                        });
                }
            })
            .catch((error) =>
                console.error("Error loading warehouses:", error),
            );
    }

    // Add animation keyframes dynamically
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0.95);
            }
        }
    `;
    document.head.appendChild(style);

    // Initially load existing warehouses
    loadWarehouses();

    // Event delegation for delete buttons - dynamically handles new and existing delete buttons
    myWarehousesList.addEventListener("click", function (event) {
        // Check if clicked element is a delete button
        if (
            event.target &&
            event.target.classList.contains("delete-warehouse-btn")
        ) {
            const deleteBtn = event.target;
            const warehouseId = deleteBtn.dataset.id;

            // Confirm before deletion
            if (!confirm("Are you sure you want to delete this warehouse?"))
                return;

            // Animate out the warehouse box
            const warehouseBox = deleteBtn.parentElement;
            warehouseBox.style.animation = "fadeOut 0.3s ease-out forwards";

            // Send delete request to the server after animation
            setTimeout(() => {
                fetch(`/warehouses/${warehouseId}`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            warehouseBox.remove();

                            // Check if no warehouses left and show empty state
                            if (myWarehousesList.children.length === 0) {
                                myWarehousesList.innerHTML =
                                    '<p class="no-warehouses">No warehouses yet. Create one to get started!</p>';
                            }
                        } else {
                            alert("Error deleting warehouse");
                            loadWarehouses(); // Reload to restore
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        alert("Error deleting warehouse");
                        loadWarehouses(); // Reload to restore
                    });
            }, 300);
        }
    });

    // Create new warehouse
    createBtn.addEventListener("click", function () {
        const warehouseName = warehouseInput.value.trim();
        if (!warehouseName) {
            alert("Please enter a warehouse name.");
            return;
        }

        // Disable button during submission
        createBtn.disabled = true;
        createBtn.textContent = "Creating...";

        // Send request to create new warehouse via AJAX
        fetch("/warehouses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({ warehouse_name: warehouseName }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(
                        document.getElementById("createWarehouseModal"),
                    );
                    modal.hide();

                    // Add new warehouse box to "My Warehouses"
                    const warehouseBox = addWarehouseBox(data.warehouse, true);

                    // Remove "no warehouses" message if it exists
                    const noWarehousesMsg =
                        myWarehousesList.querySelector(".no-warehouses");
                    if (noWarehousesMsg) {
                        noWarehousesMsg.remove();
                    }

                    myWarehousesList.appendChild(warehouseBox);
                    warehouseInput.value = ""; // Clear input

                    // Reset button
                    createBtn.disabled = false;
                    createBtn.textContent = "Create Warehouse";
                } else {
                    alert("Error: " + data.message);
                    // Reset button
                    createBtn.disabled = false;
                    createBtn.textContent = "Create Warehouse";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Error creating warehouse");
                // Reset button
                createBtn.disabled = false;
                createBtn.textContent = "Create Warehouse";
            });
    });

    // Allow creating warehouse by pressing Enter in input field
    warehouseInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            createBtn.click();
        }
    });
});

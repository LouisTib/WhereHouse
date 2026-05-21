document.addEventListener("DOMContentLoaded", function () {
    const createBtn = document.getElementById("createWarehouseBtn");
    const warehouseInput = document.getElementById("warehouseName");
    const warehouseWidthInput = document.getElementById("warehouseWidth");
    const warehouseHeightInput = document.getElementById("warehouseHeight");
    const myWarehousesList = document.getElementById("myWarehouses");
    const sharedWarehousesList = document.getElementById("sharedWarehouses");
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");
    const dashboardSearchInput = document.getElementById(
        "dashboardSearchInput",
    );

    let searchTimeout = null;

    function addWarehouseBox(warehouse, isOwned = true) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("warehouse-icon");
        newDiv.dataset.id = warehouse.id;

        const warehouseLink = document.createElement("a");
        warehouseLink.classList.add("warehouse-name");
        warehouseLink.href = `/warehouses/${warehouse.id}`;
        warehouseLink.textContent = warehouse.warehouse_name;
        newDiv.appendChild(warehouseLink);

        if (isOwned) {
            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("delete-warehouse-btn");
            deleteBtn.textContent = "×";
            deleteBtn.dataset.id = warehouse.id;
            deleteBtn.setAttribute("aria-label", "Delete warehouse");
            newDiv.appendChild(deleteBtn);
        } else {
            newDiv.classList.add("shared");
        }

        newDiv.style.animation = "slideInUp 0.4s ease-out forwards";
        newDiv.style.opacity = "0";

        return newDiv;
    }

    function loadWarehouses() {
        fetch("/warehouses", { headers: { Accept: "application/json" } })
            .then((r) => r.json())
            .then((data) => {
                if (!data.warehouses) return;
                myWarehousesList.innerHTML = "";
                sharedWarehousesList.innerHTML = "";

                fetch("/api/user")
                    .then((r) => r.json())
                    .then((userData) => {
                        const currentUserId = userData.id;
                        const owned = data.warehouses.filter(
                            (w) => w.user_id === currentUserId,
                        );
                        const shared = data.warehouses.filter(
                            (w) => w.user_id !== currentUserId,
                        );

                        if (owned.length > 0) {
                            owned.forEach((w, i) => {
                                const box = addWarehouseBox(w, true);
                                box.style.animationDelay = `${i * 0.05}s`;
                                myWarehousesList.appendChild(box);
                            });
                        } else {
                            myWarehousesList.innerHTML =
                                '<p class="no-warehouses">No warehouses yet. Create one to get started!</p>';
                        }

                        if (shared.length > 0) {
                            shared.forEach((w, i) => {
                                const box = addWarehouseBox(w, false);
                                box.style.animationDelay = `${i * 0.05}s`;
                                sharedWarehousesList.appendChild(box);
                            });
                        } else {
                            sharedWarehousesList.innerHTML =
                                '<p class="no-warehouses">No shared warehouses</p>';
                        }
                    })
                    .catch(() => {
                        data.warehouses.forEach((w, i) => {
                            const box = addWarehouseBox(w, true);
                            box.style.animationDelay = `${i * 0.05}s`;
                            myWarehousesList.appendChild(box);
                        });
                    });
            })
            .catch((err) => console.error("Error loading warehouses:", err));
    }

    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to   { opacity: 0; transform: scale(0.95); }
        }
    `;
    document.head.appendChild(style);

    loadWarehouses();

    // ============ DELETE ============

    myWarehousesList.addEventListener("click", function (event) {
        if (!event.target.classList.contains("delete-warehouse-btn")) return;

        const deleteBtn = event.target;
        const warehouseId = deleteBtn.dataset.id;
        if (!confirm("Are you sure you want to delete this warehouse?")) return;

        const warehouseBox = deleteBtn.parentElement;
        warehouseBox.style.animation = "fadeOut 0.3s ease-out forwards";

        setTimeout(() => {
            fetch(`/warehouses/${warehouseId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.success) {
                        warehouseBox.remove();
                        if (myWarehousesList.children.length === 0) {
                            myWarehousesList.innerHTML =
                                '<p class="no-warehouses">No warehouses yet. Create one to get started!</p>';
                        }
                    } else {
                        alert("Error deleting warehouse");
                        loadWarehouses();
                    }
                })
                .catch(() => {
                    alert("Error deleting warehouse");
                    loadWarehouses();
                });
        }, 300);
    });

    // ============ CREATE ============

    createBtn.addEventListener("click", function () {
        const warehouseName = warehouseInput.value.trim();
        if (!warehouseName) {
            alert("Please enter a warehouse name.");
            return;
        }

        const gridWidth = parseInt(warehouseWidthInput.value) || 30;
        const gridHeight = parseInt(warehouseHeightInput.value) || 20;

        if (
            gridWidth < 5 ||
            gridWidth > 100 ||
            gridHeight < 5 ||
            gridHeight > 100
        ) {
            alert("Grid dimensions must be between 5 and 100.");
            return;
        }

        createBtn.disabled = true;
        createBtn.textContent = "Creating...";

        fetch("/warehouses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
                warehouse_name: warehouseName,
                grid_width: gridWidth,
                grid_height: gridHeight,
            }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    bootstrap.Modal.getInstance(
                        document.getElementById("createWarehouseModal"),
                    ).hide();
                    const box = addWarehouseBox(data.warehouse, true);
                    const noMsg =
                        myWarehousesList.querySelector(".no-warehouses");
                    if (noMsg) noMsg.remove();
                    myWarehousesList.appendChild(box);
                    warehouseInput.value = "";
                    warehouseWidthInput.value = "30";
                    warehouseHeightInput.value = "20";
                } else {
                    alert("Error: " + data.message);
                }
                createBtn.disabled = false;
                createBtn.textContent = "Create Warehouse";
            })
            .catch(() => {
                alert("Error creating warehouse");
                createBtn.disabled = false;
                createBtn.textContent = "Create Warehouse";
            });
    });

    warehouseInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") createBtn.click();
    });

    // ============ GLOBAL PRODUCT SEARCH ============

    function clearWarehouseHighlights() {
        document
            .querySelectorAll(".warehouse-icon.search-highlighted")
            .forEach((el) => {
                el.classList.remove("search-highlighted");
            });
    }

    function highlightWarehouses(warehouseIds) {
        clearWarehouseHighlights();
        warehouseIds.forEach((id) => {
            const box = document.querySelector(
                `.warehouse-icon[data-id="${id}"]`,
            );
            if (box) box.classList.add("search-highlighted");
        });
    }

    function performGlobalSearch(query) {
        if (query.length < 2) {
            clearWarehouseHighlights();
            return;
        }

        fetch(`/search/products?q=${encodeURIComponent(query)}`, {
            headers: { Accept: "application/json" },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.products && data.products.length > 0) {
                    const matchingWarehouseIds = [
                        ...new Set(data.products.map((p) => p.warehouse_id)),
                    ];
                    highlightWarehouses(matchingWarehouseIds);
                } else {
                    clearWarehouseHighlights();
                }
            })
            .catch((err) => console.error("Search error:", err));
    }

    dashboardSearchInput.addEventListener("input", function () {
        const query = dashboardSearchInput.value.trim();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performGlobalSearch(query), 300);
    });
});

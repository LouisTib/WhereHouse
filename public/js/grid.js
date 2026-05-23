document.addEventListener("DOMContentLoaded", function () {
    const warehouseId = document
        .querySelector('meta[name="warehouse-id"]')
        .getAttribute("content");
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");
    const gridWidth =
        parseInt(
            document
                .querySelector('meta[name="grid-width"]')
                .getAttribute("content"),
        ) || 30;
    const gridHeight =
        parseInt(
            document
                .querySelector('meta[name="grid-height"]')
                .getAttribute("content"),
        ) || 20;

    const gridCanvas = document.getElementById("gridCanvas");
    const sectionsList = document.getElementById("sectionsList");
    const createSectionBtn = document.getElementById("createSectionBtn");
    const sectionNameInput = document.getElementById("sectionNameInput");
    const searchInput = document.getElementById("searchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");

    const productNameInput = document.getElementById("productName");
    const productSkuInput = document.getElementById("productSku");
    const productQuantityInput = document.getElementById("productQuantity");
    const productSectionIdInput = document.getElementById("productSectionId");
    const addProductBtn = document.getElementById("addProductBtn");
    const modalSectionName = document.getElementById("modalSectionName");

    const editProductNameInput = document.getElementById("editProductName");
    const editProductSkuInput = document.getElementById("editProductSku");
    const editProductQuantityInput = document.getElementById(
        "editProductQuantity",
    );
    const editProductIdInput = document.getElementById("editProductId");
    const editProductSectionIdInput = document.getElementById(
        "editProductSectionId",
    );
    const updateProductBtn = document.getElementById("updateProductBtn");

    const shareEmailInput = document.getElementById("shareEmail");
    const shareWarehouseBtn = document.getElementById("shareWarehouseBtn");
    const sharedUsersList = document.getElementById("sharedUsersList");

    const warehouseNameDisplay = document.getElementById(
        "warehouseNameDisplay",
    );
    const warehouseNameInput = document.getElementById("warehouseNameInput");

    const resizeWidthInput = document.getElementById("resizeWidth");
    const resizeHeightInput = document.getElementById("resizeHeight");
    const applyResizeBtn = document.getElementById("applyResizeBtn");
    const resizeWarning = document.getElementById("resizeWarning");

    let sections = [];
    let creatingSection = false;
    let newSectionName = "";
    let draggedSection = null;
    let currentSearchTerm = "";
    let movingSectionMobile = null;

    function isMobile() {
        return (
            /Mobi|Android/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 0 &&
                !window.matchMedia("(hover: hover)").matches)
        );
    }

    // ============ WAREHOUSE NAME EDITING ============

    warehouseNameDisplay.addEventListener("click", function () {
        warehouseNameDisplay.style.display = "none";
        warehouseNameInput.style.display = "block";
        warehouseNameInput.focus();
        warehouseNameInput.select();
    });

    warehouseNameInput.addEventListener("blur", saveWarehouseName);
    warehouseNameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") saveWarehouseName();
        else if (e.key === "Escape") cancelWarehouseNameEdit();
    });

    function saveWarehouseName() {
        const newName = warehouseNameInput.value.trim();
        if (!newName) {
            alert("Warehouse name cannot be empty");
            cancelWarehouseNameEdit();
            return;
        }
        fetch(`/warehouses/${warehouseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({ warehouse_name: newName }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    warehouseNameDisplay.textContent = newName;
                    warehouseNameDisplay.style.display = "block";
                    warehouseNameInput.style.display = "none";
                } else {
                    alert("Error: " + data.message);
                    cancelWarehouseNameEdit();
                }
            })
            .catch(() => {
                alert("Error updating warehouse name");
                cancelWarehouseNameEdit();
            });
    }

    function cancelWarehouseNameEdit() {
        warehouseNameInput.value = warehouseNameDisplay.textContent;
        warehouseNameDisplay.style.display = "block";
        warehouseNameInput.style.display = "none";
    }

    // ============ GRID GENERATION ============

    function generateGrid() {
        gridCanvas.innerHTML = "";

        const cellSize =
            window.innerWidth <= 768 ? 25 : window.innerWidth <= 1200 ? 35 : 40;

        gridCanvas.style.gridTemplateColumns = `repeat(${gridWidth}, ${cellSize}px)`;
        gridCanvas.style.gridTemplateRows = `repeat(${gridHeight}, ${cellSize}px)`;

        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const cell = document.createElement("div");
                cell.classList.add("grid-cell");
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.addEventListener("click", (e) => handleCellClick(e, x, y));
                cell.addEventListener("dragover", (e) => handleDragOver(e));
                cell.addEventListener("drop", (e) => handleDrop(e, x, y));
                gridCanvas.appendChild(cell);
            }
        }
    }

    // ============ SECTION MANAGEMENT ============

    function renderSections() {
        document.querySelectorAll(".grid-cell").forEach((cell) => {
            cell.classList.remove("occupied", "mobile-moving");
            cell.textContent = "";
            cell.removeAttribute("draggable");
            cell.dataset.sectionId = "";
        });

        sections.forEach((section) => {
            if (section.grid_x !== null && section.grid_y !== null) {
                const cell = document.querySelector(
                    `.grid-cell[data-x="${section.grid_x}"][data-y="${section.grid_y}"]`,
                );
                if (cell) {
                    cell.classList.add("occupied");
                    cell.textContent = section.section_name;
                    cell.dataset.sectionId = section.id;
                    cell.draggable = true;
                    cell.ondragstart = (e) => handleDragStart(e, section);
                    cell.ondragend = handleDragEnd;
                    if (
                        movingSectionMobile &&
                        movingSectionMobile.id == section.id
                    ) {
                        cell.classList.add("mobile-moving");
                    }
                }
            }
        });

        if (currentSearchTerm) performSearch(currentSearchTerm);
    }

    function loadSections() {
        fetch(`/warehouses/${warehouseId}/sections`)
            .then((r) => r.json())
            .then((data) => {
                if (data.sections) {
                    sections = data.sections.sort((a, b) =>
                        a.section_name.localeCompare(
                            b.section_name,
                            undefined,
                            { numeric: true, sensitivity: "base" },
                        ),
                    );
                    renderSections();
                    renderSidebar();
                }
            })
            .catch((err) => console.error("Error loading sections:", err));
    }

    function renderSidebar() {
        sectionsList.innerHTML = "";

        sections.forEach((section) => {
            const sectionItem = document.createElement("div");
            sectionItem.classList.add("section-item");
            sectionItem.dataset.sectionId = section.id;
            sectionItem.dataset.gridX = section.grid_x;
            sectionItem.dataset.gridY = section.grid_y;

            const header = document.createElement("div");
            header.classList.add("section-item-header");

            const name = document.createElement("span");
            name.classList.add("section-item-name", "editable-section-name");
            name.textContent = section.section_name;
            name.dataset.sectionId = section.id;
            name.title = "Click to edit";
            name.addEventListener("click", (e) => {
                e.stopPropagation();
                editSectionName(section.id, name);
            });

            const actions = document.createElement("div");
            actions.classList.add("section-item-actions");

            const addBtn = document.createElement("button");
            addBtn.classList.add("btn-add-product");
            addBtn.textContent = "+";
            addBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                openProductModal(section.id, section.section_name);
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("btn-delete-section");
            deleteBtn.textContent = "×";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteSection(section.id);
            });

            actions.appendChild(addBtn);
            actions.appendChild(deleteBtn);
            header.appendChild(name);
            header.appendChild(actions);

            const productsContainer = document.createElement("div");
            productsContainer.classList.add("section-item-products");
            loadProductsForSection(section.id, productsContainer);

            sectionItem.appendChild(header);
            sectionItem.appendChild(productsContainer);
            sectionItem.addEventListener("click", () =>
                highlightSectionOnGrid(section.id),
            );

            sectionsList.appendChild(sectionItem);
        });
    }

    // ============ SECTION NAME EDITING ============

    function editSectionName(sectionId, nameElement) {
        const currentName = nameElement.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("section-name-input");
        input.value = currentName;
        nameElement.replaceWith(input);
        input.focus();
        input.select();

        const save = () => {
            const newName = input.value.trim();
            if (!newName) {
                alert("Section name cannot be empty");
                input.replaceWith(nameElement);
                return;
            }
            fetch(`/warehouses/${warehouseId}/sections/${sectionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ section_name: newName }),
            })
                .then((r) => r.json())
                .then((data) => {
                    if (data.success) {
                        const s = sections.find((s) => s.id == sectionId);
                        if (s) s.section_name = newName;
                        renderSections();
                        renderSidebar();
                    } else {
                        alert("Error: " + data.message);
                        input.replaceWith(nameElement);
                    }
                })
                .catch(() => {
                    alert("Error updating section name");
                    input.replaceWith(nameElement);
                });
        };

        input.addEventListener("blur", save);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") save();
            else if (e.key === "Escape") input.replaceWith(nameElement);
        });
    }

    // ============ CELL CLICK ============

    function handleCellClick(e, x, y) {
        x = parseInt(x);
        y = parseInt(y);
        const cell = e.target.closest(".grid-cell");

        if (creatingSection) {
            placeSectionOnGrid(x, y);
            return;
        }
        if (!isMobile()) return;

        if (movingSectionMobile) {
            e.stopPropagation();
            if (
                !cell.classList.contains("occupied") ||
                cell.dataset.sectionId == movingSectionMobile.id
            ) {
                if (cell.dataset.sectionId == movingSectionMobile.id) {
                    movingSectionMobile = null;
                    clearMobileHighlights();
                } else {
                    updateSectionPosition(movingSectionMobile.id, x, y);
                    movingSectionMobile = null;
                }
            } else {
                alert("Cell occupied. Cancelling move.");
                movingSectionMobile = null;
                clearMobileHighlights();
            }
            return;
        }

        if (cell.classList.contains("occupied") && cell.dataset.sectionId) {
            e.stopPropagation();
            const section = sections.find(
                (s) => s.id == cell.dataset.sectionId,
            );
            if (section) {
                movingSectionMobile = section;
                cell.classList.add("mobile-moving");
            }
        }
    }

    function clearMobileHighlights() {
        document
            .querySelectorAll(".grid-cell.mobile-moving")
            .forEach((c) => c.classList.remove("mobile-moving"));
    }

    // ============ SECTION CREATION ============

    createSectionBtn.addEventListener("click", () => {
        new bootstrap.Modal(
            document.getElementById("createSectionModal"),
        ).show();
    });

    const createSectionModalElement =
        document.getElementById("createSectionModal");

    createSectionModalElement.addEventListener("hidden.bs.modal", () => {
        const name = sectionNameInput.value.trim();
        if (name && !creatingSection) {
            newSectionName = name;
            creatingSection = true;
            alert("Click on an empty grid cell to place the section");
        } else if (!creatingSection) {
            cancelSectionCreation();
        }
    });

    createSectionModalElement.addEventListener("click", (e) => {
        if (
            e.target.classList.contains("btn-close") ||
            e.target.classList.contains("btn-secondary")
        ) {
            cancelSectionCreation();
        }
    });

    function cancelSectionCreation() {
        creatingSection = false;
        newSectionName = "";
        sectionNameInput.value = "";
    }

    function placeSectionOnGrid(x, y) {
        if (!creatingSection || !newSectionName) return;
        const cell = document.querySelector(
            `.grid-cell[data-x="${x}"][data-y="${y}"]`,
        );
        if (cell.classList.contains("occupied")) {
            alert("This cell is already occupied!");
            return;
        }

        fetch(`/warehouses/${warehouseId}/sections`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
                section_name: newSectionName,
                grid_x: x,
                grid_y: y,
            }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    sections.push(data.section);
                    renderSections();
                    renderSidebar();
                    cancelSectionCreation();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(() => alert("Error creating section"));
    }

    function deleteSection(sectionId) {
        if (!confirm("Delete this section and all its products?")) return;
        fetch(`/warehouses/${warehouseId}/sections/${sectionId}`, {
            method: "DELETE",
            headers: { "X-CSRF-TOKEN": csrfToken },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    sections = sections.filter((s) => s.id != sectionId);
                    renderSections();
                    renderSidebar();
                } else {
                    alert("Error deleting section");
                }
            })
            .catch(() => alert("Error deleting section"));
    }

    // ============ DRAG AND DROP ============

    function handleDragStart(e, section) {
        if (isMobile()) {
            e.preventDefault();
            return;
        }
        draggedSection = section;
        e.target.classList.add("dragging");
    }

    function handleDragEnd(e) {
        e.target.classList.remove("dragging");
        document
            .querySelectorAll(".grid-cell")
            .forEach((c) => c.classList.remove("available-drop"));
    }

    function handleDragOver(e) {
        if (isMobile()) return;
        e.preventDefault();
        const cell = e.target.closest(".grid-cell");
        if (cell && !cell.classList.contains("occupied"))
            cell.classList.add("available-drop");
    }

    function handleDrop(e, x, y) {
        if (isMobile()) return;
        e.preventDefault();
        if (!draggedSection) return;
        const cell = e.target.closest(".grid-cell");
        if (
            cell.classList.contains("occupied") &&
            cell.dataset.sectionId != draggedSection.id
        ) {
            alert("This cell is already occupied!");
            return;
        }
        updateSectionPosition(draggedSection.id, x, y);
        draggedSection = null;
    }

    function updateSectionPosition(sectionId, x, y) {
        clearHighlights();
        clearMobileHighlights();
        fetch(`/warehouses/${warehouseId}/sections/${sectionId}/position`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({ grid_x: x, grid_y: y }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    const s = sections.find((s) => s.id == sectionId);
                    if (s) {
                        s.grid_x = x;
                        s.grid_y = y;
                    }
                    renderSections();
                    renderSidebar();
                    if (currentSearchTerm) performSearch(currentSearchTerm);
                } else {
                    alert("Error updating position");
                }
            })
            .catch(() => alert("Error updating position"));
    }

    // ============ PRODUCT MANAGEMENT ============

    function loadProductsForSection(sectionId, container) {
        fetch(`/warehouses/${warehouseId}/sections/${sectionId}/products`)
            .then((r) => r.json())
            .then((data) => {
                if (data.products) {
                    container.innerHTML = "";
                    data.products.forEach((p) =>
                        addProductToSidebar(p, sectionId, container),
                    );
                }
            })
            .catch((err) => console.error("Error loading products:", err));
    }

    function addProductToSidebar(product, sectionId, container) {
        const item = document.createElement("div");
        item.classList.add("product-item-small");
        item.dataset.productId = product.id;
        item.dataset.sectionId = sectionId;

        const name = document.createElement("span");
        name.classList.add("product-item-name");
        name.textContent = product.product_name;

        const qty = document.createElement("span");
        qty.classList.add("product-item-qty");
        qty.textContent = `Qty: ${product.quantity}`;

        const editBtn = document.createElement("button");
        editBtn.classList.add("btn-edit-product");
        editBtn.textContent = "✎";
        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openEditProductModal(sectionId, product);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn-delete-product");
        deleteBtn.textContent = "×";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteProduct(sectionId, product.id);
        });

        item.appendChild(name);
        item.appendChild(qty);
        item.appendChild(editBtn);
        item.appendChild(deleteBtn);
        container.appendChild(item);
    }

    function openProductModal(sectionId, sectionName) {
        productSectionIdInput.value = sectionId;
        modalSectionName.textContent = sectionName;
        new bootstrap.Modal(
            document.getElementById("createProductModal"),
        ).show();
    }

    addProductBtn.addEventListener("click", () => {
        const name = productNameInput.value.trim();
        const sku = productSkuInput.value.trim();
        const quantity = productQuantityInput.value.trim();
        const sectionId = productSectionIdInput.value;
        if (!name) {
            alert("Please enter a product name");
            return;
        }

        fetch(`/warehouses/${warehouseId}/sections/${sectionId}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
                product_name: name,
                sku: sku || null,
                quantity: quantity || 0,
            }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    bootstrap.Modal.getInstance(
                        document.getElementById("createProductModal"),
                    ).hide();
                    productNameInput.value = "";
                    productSkuInput.value = "";
                    productQuantityInput.value = "0";
                    renderSidebar();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(() => alert("Error creating product"));
    });

    function openEditProductModal(sectionId, product) {
        editProductIdInput.value = product.id;
        editProductSectionIdInput.value = sectionId;
        editProductNameInput.value = product.product_name;
        editProductSkuInput.value = product.sku || "";
        editProductQuantityInput.value = product.quantity;
        new bootstrap.Modal(document.getElementById("editProductModal")).show();
    }

    updateProductBtn.addEventListener("click", () => {
        const productId = editProductIdInput.value;
        const sectionId = editProductSectionIdInput.value;
        const name = editProductNameInput.value.trim();
        const sku = editProductSkuInput.value.trim();
        const quantity = editProductQuantityInput.value.trim();
        if (!name) {
            alert("Please enter a product name");
            return;
        }

        fetch(
            `/warehouses/${warehouseId}/sections/${sectionId}/products/${productId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    product_name: name,
                    sku: sku || null,
                    quantity: quantity || 0,
                }),
            },
        )
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    bootstrap.Modal.getInstance(
                        document.getElementById("editProductModal"),
                    ).hide();
                    renderSidebar();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(() => alert("Error updating product"));
    });

    function deleteProduct(sectionId, productId) {
        if (!confirm("Delete this product?")) return;
        fetch(
            `/warehouses/${warehouseId}/sections/${sectionId}/products/${productId}`,
            {
                method: "DELETE",
                headers: { "X-CSRF-TOKEN": csrfToken },
            },
        )
            .then((r) => r.json())
            .then((data) => {
                if (data.success) renderSidebar();
                else alert("Error deleting product");
            })
            .catch(() => alert("Error deleting product"));
    }

    // ============ SEARCH ============

    searchInput.addEventListener("input", function () {
        currentSearchTerm = searchInput.value.trim().toLowerCase();
        clearHighlights();
        if (currentSearchTerm.length >= 2) performSearch(currentSearchTerm);
    });

    function performSearch(searchTerm) {
        // Fetch all products for all sections in one go per section,
        // but track which search term we started with to avoid stale results
        const termAtStart = searchTerm;

        sections.forEach((section) => {
            fetch(`/warehouses/${warehouseId}/sections/${section.id}/products`)
                .then((r) => r.json())
                .then((data) => {
                    // If the search term changed by the time this returns, ignore it
                    if (currentSearchTerm !== termAtStart) return;

                    if (data.products) {
                        const match = data.products.some(
                            (p) =>
                                p.product_name
                                    .toLowerCase()
                                    .includes(termAtStart) ||
                                (p.sku &&
                                    p.sku.toLowerCase().includes(termAtStart)),
                        );
                        if (match) highlightSection(section.id);
                    }
                })
                .catch((err) => console.error("Error searching:", err));
        });
    }

    clearSearchBtn.addEventListener("click", function () {
        searchInput.value = "";
        currentSearchTerm = "";
        clearHighlights();
    });

    function highlightSection(sectionId) {
        const section = sections.find((s) => s.id == sectionId);
        if (!section || section.grid_x === null || section.grid_y === null)
            return;

        const gridCell = document.querySelector(
            `.grid-cell[data-x="${section.grid_x}"][data-y="${section.grid_y}"]`,
        );
        if (gridCell) gridCell.classList.add("highlighted");

        const sidebarItem = document.querySelector(
            `.section-item[data-section-id="${sectionId}"]`,
        );
        if (sidebarItem) {
            sidebarItem.classList.add("highlighted");
        }
    }

    function highlightSectionOnGrid(sectionId) {
        clearHighlights();
        highlightSection(sectionId);
    }

    function clearHighlights() {
        document
            .querySelectorAll(".grid-cell.highlighted")
            .forEach((c) => c.classList.remove("highlighted"));
        document
            .querySelectorAll(".section-item.highlighted")
            .forEach((i) => i.classList.remove("highlighted"));
    }

    // ============ SHARE ============

    document
        .getElementById("shareWarehouseModal")
        .addEventListener("shown.bs.modal", loadSharedUsers);

    function loadSharedUsers() {
        sharedUsersList.innerHTML = '<p class="loading-users">Loading...</p>';
        fetch(`/warehouses/${warehouseId}/shared-users`)
            .then((r) => r.json())
            .then((data) => {
                sharedUsersList.innerHTML = "";
                if (data.success && data.users && data.users.length > 0) {
                    data.users.forEach(addSharedUserToList);
                } else {
                    sharedUsersList.innerHTML =
                        '<p class="no-shared-users">No users shared with yet</p>';
                }
            })
            .catch(() => {
                sharedUsersList.innerHTML =
                    '<p class="no-shared-users">Error loading users</p>';
            });
    }

    function addSharedUserToList(user) {
        const item = document.createElement("div");
        item.classList.add("shared-user-item");
        item.dataset.userId = user.id;

        const info = document.createElement("div");
        info.classList.add("shared-user-info");

        const userName = document.createElement("div");
        userName.classList.add("shared-user-name");
        userName.textContent = user.name;

        const userEmail = document.createElement("div");
        userEmail.classList.add("shared-user-email");
        userEmail.textContent = user.email;

        info.appendChild(userName);
        info.appendChild(userEmail);

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("btn-remove-user");
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => removeSharedUser(user.id));

        item.appendChild(info);
        item.appendChild(removeBtn);
        sharedUsersList.appendChild(item);
    }

    shareWarehouseBtn.addEventListener("click", function () {
        const email = shareEmailInput.value.trim();
        if (!email) {
            alert("Please enter an email address");
            return;
        }
        fetch(`/warehouses/${warehouseId}/share`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({ email }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    shareEmailInput.value = "";
                    alert("Warehouse shared successfully!");
                    loadSharedUsers();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(() => alert("Error sharing warehouse"));
    });

    function removeSharedUser(userId) {
        if (!confirm("Remove this user's access to the warehouse?")) return;
        fetch(`/warehouses/${warehouseId}/shared-users/${userId}`, {
            method: "DELETE",
            headers: { "X-CSRF-TOKEN": csrfToken },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    alert("User removed successfully");
                    loadSharedUsers();
                } else {
                    alert("Error removing user");
                }
            })
            .catch(() => alert("Error removing user"));
    }

    // ============ RESIZE ============

    resizeWidthInput.addEventListener("input", checkResizeWarning);
    resizeHeightInput.addEventListener("input", checkResizeWarning);

    function checkResizeWarning() {
        const newW = parseInt(resizeWidthInput.value);
        const newH = parseInt(resizeHeightInput.value);
        resizeWarning.style.display =
            newW < gridWidth || newH < gridHeight ? "block" : "none";
    }

    applyResizeBtn.addEventListener("click", function () {
        const newWidth = parseInt(resizeWidthInput.value);
        const newHeight = parseInt(resizeHeightInput.value);

        if (
            newWidth < 5 ||
            newHeight < 5 ||
            newWidth > 100 ||
            newHeight > 100
        ) {
            alert("Grid dimensions must be between 5 and 100.");
            return;
        }

        fetch(`/warehouses/${warehouseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
                grid_width: newWidth,
                grid_height: newHeight,
            }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    if (data.out_of_bounds > 0) {
                        alert(
                            `Grid resized. ${data.out_of_bounds} section(s) are now outside the grid — they still exist in the sidebar but won't appear on the grid until repositioned.`,
                        );
                    }
                    window.location.reload();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(() => alert("Error resizing grid"));
    });

    // ============ INIT ============

    generateGrid();
    loadSections();
});

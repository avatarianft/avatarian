"use strict";

const products = Object.freeze([
    { id: "p1", title: "کیف روزمره مینیمال", category: "اکسسوری", price: 890000, icon: "👜" },
    { id: "p2", title: "پیراهن ساده سفید", category: "پوشاک", price: 720000, icon: "👕" },
    { id: "p3", title: "ماگ سرامیکی آواتاریان", category: "خانه", price: 245000, icon: "☕" },
    { id: "p4", title: "کلاه کتان کلاسیک", category: "پوشاک", price: 380000, icon: "🧢" },
    { id: "p5", title: "کیف پول چرمی", category: "اکسسوری", price: 540000, icon: "👝" },
    { id: "p6", title: "چراغ رومیزی ساده", category: "خانه", price: 980000, icon: "💡" },
    { id: "p7", title: "شال نخی سبک", category: "پوشاک", price: 460000, icon: "🧣" },
    { id: "p8", title: "جعبه نظم‌دهنده میز", category: "خانه", price: 310000, icon: "📦" }
]);

const state = {
    query: "",
    category: "all",
    cart: loadCart()
};

const numberFormat = new Intl.NumberFormat("fa-IR");

const elements = {
    productsGrid: document.querySelector("#productsGrid"),
    emptyState: document.querySelector("#emptyState"),
    searchInput: document.querySelector("#searchInput"),
    categorySelect: document.querySelector("#categorySelect"),
    cartToggle: document.querySelector("#cartToggle"),
    cartClose: document.querySelector("#cartClose"),
    cartPanel: document.querySelector("#cartPanel"),
    cartCount: document.querySelector("#cartCount"),
    cartItems: document.querySelector("#cartItems"),
    cartTotal: document.querySelector("#cartTotal"),
    clearCart: document.querySelector("#clearCart")
};

function loadCart() {
    try {
        const raw = localStorage.getItem("avatarian_cart_v1");
        const parsed = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(item =>
            item &&
            typeof item.id === "string" &&
            Number.isInteger(item.qty) &&
            item.qty > 0 &&
            item.qty <= 99
        );
    } catch {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem("avatarian_cart_v1", JSON.stringify(state.cart));
    } catch {
        // ذخیره‌سازی محلی اختیاری است و مانع نمایش سایت نمی‌شود.
    }
}

function formatPrice(value) {
    return `${numberFormat.format(value)} تومان`;
}

function getProduct(productId) {
    return products.find(product => product.id === productId);
}

function getCartCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function addToCart(productId) {
    const existing = state.cart.find(item => item.id === productId);

    if (existing) {
        existing.qty = Math.min(existing.qty + 1, 99);
    } else {
        state.cart.push({ id: productId, qty: 1 });
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function createProductCard(product) {
    const article = document.createElement("article");
    article.className = "product-card";

    const art = document.createElement("div");
    art.className = "product-art";
    art.setAttribute("aria-hidden", "true");
    art.textContent = product.icon;

    const content = document.createElement("div");
    content.className = "product-content";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;

    const title = document.createElement("h3");
    title.className = "product-title";
    title.textContent = product.title;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const button = document.createElement("button");
    button.className = "add-button";
    button.type = "button";
    button.textContent = "افزودن";
    button.addEventListener("click", () => addToCart(product.id));

    bottom.append(price, button);
    content.append(category, title, bottom);
    article.append(art, content);

    return article;
}

function renderProducts() {
    const normalizedQuery = state.query.trim().toLocaleLowerCase("fa-IR");

    const filtered = products.filter(product => {
        const matchesCategory =
            state.category === "all" || product.category === state.category;

        const searchableText =
            `${product.title} ${product.category}`.toLocaleLowerCase("fa-IR");

        return matchesCategory && searchableText.includes(normalizedQuery);
    });

    elements.productsGrid.replaceChildren();

    filtered.forEach(product => {
        elements.productsGrid.append(createProductCard(product));
    });

    elements.emptyState.hidden = filtered.length !== 0;
}

function renderCart() {
    const count = getCartCount();
    elements.cartCount.textContent = numberFormat.format(count);
    elements.cartItems.replaceChildren();

    let total = 0;

    state.cart.forEach(item => {
        const product = getProduct(item.id);

        if (!product) {
            return;
        }

        total += product.price * item.qty;

        const row = document.createElement("div");
        row.className = "cart-row";

        const info = document.createElement("div");
        info.className = "cart-row-info";

        const title = document.createElement("strong");
        title.textContent = product.title;

        const details = document.createElement("small");
        details.textContent = `${numberFormat.format(item.qty)} عدد — ${formatPrice(product.price * item.qty)}`;

        const remove = document.createElement("button");
        remove.className = "remove-button";
        remove.type = "button";
        remove.textContent = "حذف";
        remove.addEventListener("click", () => removeFromCart(product.id));

        info.append(title, details);
        row.append(info, remove);
        elements.cartItems.append(row);
    });

    if (state.cart.length === 0) {
        const empty = document.createElement("p");
        empty.className = "demo-note";
        empty.textContent = "سبد خرید شما خالی است.";
        elements.cartItems.append(empty);
    }

    elements.cartTotal.textContent = formatPrice(total);
}

function setCartVisibility(visible) {
    elements.cartPanel.hidden = !visible;
    elements.cartToggle.setAttribute("aria-expanded", String(visible));

    if (visible) {
        elements.cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

elements.searchInput.addEventListener("input", event => {
    state.query = event.target.value;
    renderProducts();
});

elements.categorySelect.addEventListener("change", event => {
    state.category = event.target.value;
    renderProducts();
});

elements.cartToggle.addEventListener("click", () => {
    setCartVisibility(elements.cartPanel.hidden);
});

elements.cartClose.addEventListener("click", () => {
    setCartVisibility(false);
});

elements.clearCart.addEventListener("click", () => {
    state.cart = [];
    saveCart();
    renderCart();
});

renderProducts();
renderCart();
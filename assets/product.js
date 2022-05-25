'use strict';

const selectors = {
  productId: '[name="id"]',
  productJSON: '[data-product-json]',
  productPrice: '.product__price',
  addToCart: '.product__atc',
  addToCartText: '.product__atc span',
};

class MainProduct extends HTMLElement {
  constructor() {
    super();
    this.variantSelect = this.querySelector(selectors.productId);
    const productJSONHTML = this.querySelector(selectors.productJSON);
    this.productJSON = productJSONHTML ? JSON.parse(productJSONHTML.innerHTML) : null;

    if (this.productJSON) {
      const currentVariant = this.productJSON.variants.find((variant) => variant.current_variant);
      this.onVariantChange(currentVariant);
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.variantSelect) {
      this.variantSelect.addEventListener('change', (event) => {
        const currentVariant = this.productJSON.variants.find((variant) => variant.id === +event.target.value);
        this.onVariantChange(currentVariant);
      });
    }
  }

  onVariantChange(currentVariant) {
    if (!this.productJSON || !currentVariant) {
      return;
    }

    const $productPrice = this.querySelector(selectors.productPrice);
    const $addToCart = this.querySelector(selectors.addToCart);
    const $addToCartText = this.querySelector(selectors.addToCartText);

    if (currentVariant) {
      window.history.replaceState({}, '', `${location.origin}${location.pathname}?variant=${currentVariant.id}`);

      $productPrice.innerHTML = formatMoney(currentVariant.price);
    }

    if (currentVariant && currentVariant.available) {
      $addToCart.removeAttribute('disabled');
      $addToCartText.innerHTML = Shopify.variantStrings.addToCart;
    } else {
      $addToCart.setAttribute('disabled', 'disabled');
      $addToCartText.innerHTML = Shopify.variantStrings.soldOut; // Not availability
    }
  }
}

customElements.define('main-product', MainProduct);

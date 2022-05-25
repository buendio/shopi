if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback);
};

Shopify.setSelectorByValue = function (selector, value) {
  for (let i = 0, count = selector.options.length; i < count; i++) {
    const option = selector.options[i];

    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);
  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));
  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    const value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },
  initProvince: function () {
    const value = this.provinceEl.getAttribute('data-default');

    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },
  countryHandler: function (e) {
    const opt = this.countryEl.options[this.countryEl.selectedIndex];
    const raw = opt.getAttribute('data-provinces');
    const provinces = JSON.parse(raw);
    this.clearOptions(this.provinceEl);

    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (let i = 0; i < provinces.length; i++) {
        const opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },
  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },
  setOptions: function (selector, values) {
    for (let i = 0, count = values.length; i < values.length; i++) {
      const opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

Shopify.isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);

function asyncVendorsLoad() {
  const scriptsToLoad = [
    // {
    //   name: 'swiper',
    //   src: getShopifyLink('swiper.min.js')
    // },
    // {
    //   name: 'fancybox',
    //   src: getShopifyLink('fancybox.js')
    // },
    {
      name: 'body-scroll-lock',
      src: getShopifyLink('body-scroll-lock.js')
    },
  ];
  const tag = document.getElementsByTagName('script')[0];
  scriptsToLoad.forEach(s => {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.async = true;
    script.src = s.src;

    script.addEventListener('load', e => {
      Shopify.vendors = Shopify.vendors || [];
      Shopify.vendors.push(s.name);
      document.dispatchEvent(new CustomEvent(`${s.name}.loaded`));
    });

    return tag.parentNode.insertBefore(script, tag);
  });
}

function serializeForm(form) {
  // Setup our serialized data
  const serialized = {}; // Loop through each field in the form

  for (let i = 0; i < form.elements.length; i++) {
    const field = form.elements[i]; // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields

    if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue; // If a multi-select, get all selections

    if (field.type === 'select-multiple') {
      for (let n = 0; n < field.options.length; n++) {
        if (!field.options[n].selected) continue;
        serialized[field.name] = field.options[n].value;
      }
    } // Convert field data to a query string
    else if (field.type !== 'checkbox' && field.type !== 'radio' || field.checked) {
      serialized[field.name] = field.value;
    }
  }

  return serialized;
};

function getShopifyLink(fileName, location = 'asset') {
  if (!Shopify.links) {
    return
  }

  const baseLink = Shopify.links[location]

  return baseLink.replace('XXX.XXX', fileName);
};

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': `application/${type}`
    }
  };
};

function formatMoney(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || Shopify.moneyFormat;

  function formatWithDelimiters(number) {
    const precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
    const thousands = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ',';
    const decimal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '.';

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);
    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    const centsAmount = parts[1] ? decimal + parts[1] : '';
    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;

    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;

    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;

    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

class StickyHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.header = document.getElementById('shopify-section-header');
    this.headerBounds = {};
    this.currentScrollTop = 0;

    this.onScrollHandler = this.onScroll.bind(this);

    window.addEventListener('scroll', this.onScrollHandler, false);

    this.createObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.onScrollHandler);
  }

  createObserver() {
    if ('IntersectionObserver' in window) {
      let observer = new IntersectionObserver((entries, observer) => {
        this.headerBounds = entries[0].intersectionRect;
        observer.disconnect();
      });

      observer.observe(this.header);
    } else {
      this.headerBounds = this.getBoundingClientRect();
    }
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    requestAnimationFrame(this.reveal.bind(this));

    if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      requestAnimationFrame(this.hide.bind(this));
    } else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
      requestAnimationFrame(this.reveal.bind(this));
    } else if (scrollTop <= this.headerBounds.top) {
      requestAnimationFrame(this.reset.bind(this));
    }

    this.currentScrollTop = scrollTop;
  }

  hide() {
    this.header.classList.add('shopify-section-header-hidden', 'shopify-section-header-sticky');
    this.closeMenuDisclosure();
  }

  reveal() {
    this.header.classList.add('shopify-section-header-sticky', 'animate');
    this.header.classList.remove('shopify-section-header-hidden');
  }

  reset() {
    this.header.classList.remove('shopify-section-header-hidden', 'shopify-section-header-sticky', 'animate');
  }

  closeMenuDisclosure() {
    this.disclosures = this.disclosures || this.header.querySelectorAll('details-disclosure');
    this.disclosures.forEach(disclosure => disclosure.close());
  }
}

customElements.define('sticky-header', StickyHeader);

class PredictiveSearch extends HTMLElement {
  constructor() {
    super();
    this.resultsBox = this.querySelector('.header__search-results');
    this.resultsTemplate = '';
    this.input = this.querySelector('[name="q"]');

    if (this.input) {
      this.input.addEventListener('input', this.search.bind(this));
      this.input.addEventListener('focus', this.search.bind(this));
    }

    this.addEventListener('click', evt => {
      if (evt.target.closest('.header__search-tabs-caption li:not(.active)')) {
        const activeCaption = document.querySelector('.header__search-tabs-caption li.active');
        const activeTabContent = document.querySelector('.header__search-tabs-content.active');
        const selectTabContent = document.querySelector(`#${evt.target.dataset.tab}`);

        activeCaption.classList.remove('active');
        activeTabContent.classList.remove('active');
        evt.target.classList.add('active');
        selectTabContent.classList.add('active');
      }
    });

    this.addEventListener('click', evt => {
      if (evt.target.closest('.header__search-overlay')) {
        this.hideResults();
      }
    });
  }

  search(evt) {
    const target = evt.target;
    const term = target.value;

    if (term.length < 2) {
      this.hideResults();
      return false;
    }

    fetch(`/search/suggest.json?q=${term}&resources[type]=product,article`).then(response => response.json()).then(suggestions => {
      const productSuggestions = suggestions.resources.results.products;
      const articleSuggestions = suggestions.resources.results.articles;
      let productsTemplate = '';
      let articlesTemplate = '';

      if (productSuggestions.length > 0) {
        productSuggestions.forEach(product => {
          productsTemplate += this.createItemTemplate({
            url: product.url,
            image: product.image,
            title: product.title,
            available: product.available,
            priceMax: product.price_max,
            priceMin: product.price_min
          });
        });
      }

      if (articleSuggestions.length > 0) {
        articleSuggestions.forEach(article => {
          articlesTemplate += this.createItemTemplate({
            url: article.url,
            image: article.image,
            title: article.title,
            author: article.author
          });
        });
      }

      if (productSuggestions.length === 0 && articleSuggestions.length === 0) {
        this.resultsTemplate = `
          <div class="header__search-overlay"></div>
          <div class="header__search-inner">
              <div class="header__search-empty">Nothing found</div>
          </div>
        `;
      } else {
        this.resultsTemplate = `
          <div class="header__search-overlay"></div>
          <div class="header__search-inner">
            <div class="header__search-tabs">
              <ul class="header__search-tabs-caption list-unstyled">
                <li class="active" data-tab="tab-products">Products (${productSuggestions.length})</li>
                <li data-tab="tab-articles">Articles (${articleSuggestions.length})</li>
              </ul>

              <div id="tab-products" class="header__search-tabs-content header__search-product-item-list active">
                ${productsTemplate ? productsTemplate : '<div class="header__search-empty">Nothing found</div>'}
              </div>

              <div id="tab-articles" class="header__search-tabs-content header__search-product-item-list">
                ${articlesTemplate ? articlesTemplate : '<div class="header__search-empty">Nothing found</div>'}
              </div>
            </div>
          </div>
        `;
      }

      this.showResults();
    }).catch(e => {
      console.error(e);
    });
  }

  createItemTemplate({
                       url,
                       image,
                       title,
                       available = true,
                       priceMax,
                       priceMin,
                       author = ''
                     }) {

    priceMax = priceMax && priceMax > priceMin ? ' - ' + formatMoney(priceMax) : ''
    priceMin = priceMin ? formatMoney(priceMin) : ''

    return `
      <div class="header__search-item">
        <a href="${url}" class="header__search-item__img">
          <img src="${image}" alt="">
        </a>
        <div class="header__search-item__desc">
          <a href="${url}" class="header__search-item__ttl">${title}</a>
          ${available && priceMin ? `<div class="header__search-item__price"><span class="money">${available ? priceMin + priceMax : 'Sold out'}</span></div>` : ''}
          ${author ? `<div class="header__search-item__author">${author}</div>` : ''}
        </div>
      </div>
    `;
  }

  showResults() {
    this.resultsBox.classList.remove('hidden');
    this.resultsBox.innerHTML = this.resultsTemplate;
    disableBodyScroll(this.resultsBox);
  }

  hideResults() {
    this.resultsBox.classList.add('hidden');
    this.resultsBox.innerHTML = '';
    enableBodyScroll(this.resultsBox);
  }
}

customElements.define('predictive-search', PredictiveSearch);

class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    const summaryElements = this.querySelectorAll('summary');
    this.addAccessibilityAttributes(summaryElements);
    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button:not(.quantity__button)').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach(element => {
      element.setAttribute('role', 'button');
      element.setAttribute('aria-expanded', false);
      element.setAttribute('aria-controls', element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;
    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;
    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget || event.target;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
      });
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined && this.mainDetailsToggle.classList.contains('menu-opening')) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = time => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }

}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
    this.menuDrawerOverlay = document.getElementById('menu-drawer-overlay');
    this.menuDrawer = document.getElementById('menu-drawer');
    this.menuDrawerOverlay.addEventListener('click', this.closeMenuDrawer.bind(this));
    window.addEventListener('resize', evt => {
      if (window.innerWidth > 989) {
        this.closeMenuDrawer(evt);
      }
    });
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom)}px`);
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
      disableBodyScroll(this.menuDrawer);
    });
    summaryElement.setAttribute('aria-expanded', true);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      enableBodyScroll(this.menuDrawer);

      this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }
}

customElements.define('header-drawer', HeaderDrawer);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', {
      bubbles: true
    });
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onButtonClick.bind(this)));
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.currentTarget.name === 'plus' ? this.input.stepUp() : this.input.stepDown();

    if (previousValue !== this.input.value) {
      this.input.dispatchEvent(this.changeEvent);
    }
  }

}

customElements.define('quantity-input', QuantityInput);

class CustomSlider extends HTMLElement {
  constructor() {
    super();
    this.sliderElement = this.querySelector('.swiper-container');
    this.slides = this.querySelectorAll('.swiper-slide');
    this.buttonPrev = this.querySelector('.slider-button-prev');
    this.buttonNext = this.querySelector('.slider-button-next');
    this.slider = null;
    const optionsJSONHTML = this.querySelector('[data-slider-options-json]');
    this.options = optionsJSONHTML ? JSON.parse(optionsJSONHTML.innerHTML) : {};
    const minSlides = this.options.minSlides || 1;

    if (this.sliderElement && this.slides.length > minSlides) {
      if (window.Shopify.vendors && window.Shopify.vendors.includes('swiper')) {
        this.initSlider();
      } else {
        document.addEventListener('swiper.loaded', () => {
          this.initSlider();
        });
      }
    }
  }

  initSlider() {
    this.slider = new Swiper(this.sliderElement, Object.assign(
      {},
      this.options,
      {
        navigation: {
          nextEl: this.buttonNext,
          prevEl: this.buttonPrev
        },
        on: {
          init: () => {
            if (this.buttonNext) {
              this.buttonNext.style.visibility = 'visible'
            }
            if (this.buttonPrev) {
              this.buttonPrev.style.visibility = 'visible'
            }
          }
        }
      })
    );
  }
}

customElements.define('custom-slider', CustomSlider);

class CustomSwatch extends HTMLElement {
  constructor() {
    super();
    this.container = this.closest('[data-product]');
    const productJSONHTML = this.container.querySelector('[data-product-json]');
    this.productJSON = productJSONHTML ? JSON.parse(productJSONHTML.innerHTML) : null;
    this.controls = this.querySelectorAll('[type="radio"]');
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.controls.length) {
      this.controls.forEach(el => {
        el.addEventListener('change', this.handleOptionChange.bind(this));
      });
    }
  }

  handleOptionChange() {
    const selectId = this.container ? this.container.querySelector('[name="id"]') : null;

    if (selectId) {
      const option1 = this.container.querySelector('[data-index="option1"]:checked');
      const option2 = this.container.querySelector('[data-index="option2"]:checked');
      const option3 = this.container.querySelector('[data-index="option3"]:checked');
      const selectedValues = [{
        value: option1 ? option1.value : null,
        index: 'option1'
      }, {
        value: option2 ? option2.value : null,
        index: 'option2'
      }, {
        value: option3 ? option3.value : null,
        index: 'option3'
      }];

      if (this.productJSON && selectId) {
        const variant = this.productJSON.variants.find(variant => selectedValues.every(({
                                                                                          value,
                                                                                          index
                                                                                        }) => value === variant[index]));
        selectId.value = variant ? variant.id : '';
        selectId.dispatchEvent(new Event('change', {
          bubbles: true
        }));
      }
    }
  }
}

customElements.define('custom-swatch', CustomSwatch);

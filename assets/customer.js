const selectors = {
  loginPage: '[data-login-page]',
  loginForm: '[data-login-form]',
  showRecoverPasswordForm: '[data-recover-show]',
  hideRecoverPasswordForm: '[data-recover-hide]',
  recoverPasswordForm: '[data-recover-form]',
  customerAddresses: '[data-customer-addresses]',
  addressToggle: '[data-address-toggle]',
  addressCountry: '[data-address-country]',
  addressProvince: '[data-address-province]',
  addressFormContainer: '[data-address-container]',
  addressForm: '[data-address-from]',
};

class CustomerLogin {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;

    if (window.location.hash === '#recover') {
      this.elements.recoverPasswordForm.classList.remove('hide');
      this.elements.loginForm.classList.add('hide');
    }

    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.loginPage);
    return container
      ? {
          container,
          loginForm: container.querySelector(selectors.loginForm),
          recoverPasswordForm: container.querySelector(selectors.recoverPasswordForm),
          showRecoverPasswordForm: container.querySelector(selectors.showRecoverPasswordForm),
          hideRecoverPasswordForm: container.querySelector(selectors.hideRecoverPasswordForm),
        }
      : {};
  }

  _setupEventListeners() {
    this.elements.showRecoverPasswordForm.addEventListener('click', this._handleShowRecoverPasswordForm.bind(this));
    this.elements.hideRecoverPasswordForm.addEventListener('click', this._handleHideRecoverPasswordForm.bind(this));
  }

  _handleShowRecoverPasswordForm() {
    this.elements.recoverPasswordForm.classList.remove('hide');
    this.elements.loginForm.classList.add('hide');
  }

  _handleHideRecoverPasswordForm() {
    this.elements.recoverPasswordForm.classList.add('hide');
    this.elements.loginForm.classList.remove('hide');
  }
}

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container
      ? {
          container,
          toggleAddressButton: container.querySelectorAll(selectors.addressToggle),
          countrySelects: container.querySelectorAll(selectors.addressCountry),
        }
      : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });

      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleAddressButton.forEach((element) => {
      element.addEventListener('click', this._handleToggleAddressButtonClick.bind(this));
    });
  }

  _handleToggleAddressButtonClick({ currentTarget }) {
    const container = currentTarget.closest(selectors.addressFormContainer);
    const form = container.querySelector(selectors.addressForm);
    form.classList.toggle('hide');
  }
}

if (Shopify.template === 'customers/login') {
  new CustomerLogin();
}

if (Shopify.template === 'customers/addresses') {
  new CustomerAddresses();
}

(() => {
  let flag = 1;
  let lazyScripts = null;
  let counterScripts = 0;

  document.addEventListener('DOMContentLoaded', function () {
    lazyScripts = document.getElementsByTagName('script');

    window.addEventListener('scroll', init);
    window.addEventListener('mousemove', init);
    window.addEventListener('touchstart', init);
    setTimeout(function () {
      init();
    }, 6000);
  });

  function init() {
    if (flag) {
      flag = 0;

      window.removeEventListener('scroll', init);
      window.removeEventListener('mousemove', init);
      window.removeEventListener('touchstart', init);

      typeof asyncVendorsLoad !== 'undefined' && asyncVendorsLoad();

      lazyLoadBgImage();
      lazyLoadIframe();
      load_all_js();
    }
  }

  function lazyLoadBgImage() {
    document.querySelectorAll('[data-bgsrc]').forEach(function (elem) {
      elem.style.backgroundImage = `url(${elem.dataset.bgsrc})`;
    });
  }

  function lazyLoadIframe() {
    document.querySelectorAll('iframe').forEach(function (elem) {
      elem.src = elem.dataset.src || elem.src;
    });
  }

  function load_all_js() {
    setTimeout(function () {
      window.dispatchEvent(new Event('custom_load'));
    }, 100);

    // lazyLoadJS("https://cdn.shopify.com/shopifycloud/shopify/assets/storefront/load_feature-a55261a7a987674749989983b5889eadaac6795d8d48548fb61470a96edb9524.js");
    // lazyLoadJS("https://cdn.shopify.com/shopifycloud/shopify/assets/shopify_pay/storefront-b61f50798075db890698930c4405673937fe89353f7fea7be88b5ce16a9c0af8.js?v=20210208");
    // lazyLoadJS("https://cdn.shopify.com/shopifycloud/shopify/assets/storefront/features-87e8399988880142f2c62771b9d8f2ff6c290b3ff745dd426eb0dfe0db9d1dae.js");
    // lazyLoadJS("https://cdn.shopify.com/shopifycloud/shopify/assets/storefront/bars/preview_bar_injector-1e3a713add37dacb26a2846054e5bf73c968340c06cb4dbaa8b985dce031f4cd.js");

    lazyScripts = document.getElementsByTagName('script');
    lazyLoadScripts();
  }

  function lazyLoadScripts() {
    if (counterScripts === lazyScripts.length) {
      return;
    }

    if (lazyScripts[counterScripts].getAttribute('type') === 'lazyload.js') {
      lazyScripts[counterScripts].setAttribute('type', 'lazyloaded');

      if (typeof lazyScripts[counterScripts].dataset.src !== 'undefined') {
        const script = document.createElement('script');
        script.src = lazyScripts[counterScripts].dataset.src;
        document.body.appendChild(script);
        script.onload = function () {
          counterScripts++;
          lazyLoadScripts();
        };
      } else {
        const script = document.createElement('script');
        script.innerHTML = lazyScripts[counterScripts].innerHTML;
        document.body.appendChild(script);
        counterScripts++;
        lazyLoadScripts();
      }
    } else {
      counterScripts++;
      lazyLoadScripts();
    }
  }

  function lazyLoadJS(url) {
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }
})();

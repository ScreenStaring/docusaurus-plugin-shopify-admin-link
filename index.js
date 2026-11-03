const path = require('path');

const {name: PLUGIN_NAME} = require('./package.json');

const DEFAULT_SHOP_PARAM = 'shop';
const DEFAULT_COOKIE_NAME = 'shop';
const DEFAULT_COOKIE_SECURE = true;

// Docusaurus plugin that adds a global client module for saving the viewer's
// shop domain and exposes the ShopifyAdminLink theme component.
module.exports = function shopifyAdminLinkPlugin(context, options = {}) {
  const shopParam = options.shopParam ?? DEFAULT_SHOP_PARAM;
  const cookie = {
    name: options.cookie?.name ?? DEFAULT_COOKIE_NAME,
    expires: options.cookie?.expires,
    // Cookies are HTTPS-only by default. Set this to false for sites served
    // over plain HTTP, such as an intranet.
    secure: options.cookie?.secure ?? DEFAULT_COOKIE_SECURE,
  };

  return {
    name: PLUGIN_NAME,

    contentLoaded({actions}) {
      actions.setGlobalData({shopParam, cookie});
    },

    getClientModules() {
      return [path.join(__dirname, 'src/clientModules/shop.js')];
    },

    getThemePath() {
      return path.join(__dirname, 'src/theme');
    },
  };
};

// Saves the shop domain from the configured query string parameter as a cookie
// so ShopifyAdminLink components can link to the viewer's Shopify Admin.
// Loaded as a Docusaurus client module; options come from the plugin's global
// data (see index.js).
import globalData from '@generated/globalData.json';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Cookies from 'js-cookie';
import packageInfo from '../../package.json';

const PLUGIN_DATA = globalData[packageInfo.name] ?? {};
// Docusaurus keys a plugin's data by plugin instance ID. "default" is the ID
// of a plugin configured once; fall back to the first instance otherwise.
const pluginOptions =
  PLUGIN_DATA.default ?? Object.values(PLUGIN_DATA)[0] ?? {};
const shopParam = pluginOptions.shopParam;
const cookie = pluginOptions.cookie ?? {};
const cookieName = cookie.name;
const expires = cookie.expires;
const secure = cookie.secure ?? true;

// A bare shop host. Rejects scheme prefixes and paths, which would otherwise
// pass an endsWith(".myshopify.com") check.
const SHOP_DOMAIN_PATTERN = /^[a-z0-9-]+\.myshopify\.com$/i;

function getCookieOptions() {
  const options = {
    path: '/',
    sameSite: 'Lax',
    secure,
  };

  if (Number.isFinite(expires) && expires > 0) {
    options.expires = new Date(Date.now() + expires * 1000);
  }

  return options;
}

function saveShop() {
  if (!ExecutionEnvironment.canUseDOM || !shopParam || !cookieName) return;

  const shop = new URLSearchParams(window.location.search)
    .get(shopParam)
    ?.trim()
    .toLowerCase();

  if (shop && SHOP_DOMAIN_PATTERN.test(shop)) {
    Cookies.set(cookieName, shop, getCookieOptions());
  }
}

// `saveShop()` is a no-op outside the browser, so no guard is needed here.
saveShop();

// Route updates cover client-side navigations that add or change the query
// string.
export function onRouteDidUpdate() {
  saveShop();
}

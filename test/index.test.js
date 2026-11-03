const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const plugin = require('../index.js');

function createPlugin(options) {
  return plugin({siteDir: process.cwd()}, options);
}

function pluginData(options) {
  let data;
  const instance = createPlugin(options);

  instance.contentLoaded({
    actions: {
      setGlobalData(value) {
        data = value;
      },
    },
  });

  return data;
}

test('defaults the shop query string parameter to "shop"', () => {
  const instance = createPlugin();

  assert.equal(instance.name, 'docusaurus-plugin-shopify-admin-link');
  assert.equal(pluginData().shopParam, 'shop');
  assert.equal(pluginData().cookie.name, 'shop');
  assert.equal(pluginData().cookie.expires, undefined);
  assert.equal(pluginData().cookie.secure, true);
});

test('uses the user-defined shop query string parameter', () => {
  assert.equal(pluginData({shopParam: 'store'}).shopParam, 'store');
});

test('uses the user-defined cookie name', () => {
  assert.equal(pluginData({cookie: {name: 'store-domain'}}).cookie.name, 'store-domain');
});

test('adds the cookie expiry in seconds', () => {
  const data = pluginData({
    shopParam: 'store',
    cookie: {name: 'store-domain', expires: 3600},
  });

  assert.equal(data.shopParam, 'store');
  assert.equal(data.cookie.name, 'store-domain');
  assert.equal(data.cookie.expires, 3600);
});

test('allows cookies over plain HTTP when secure is false', () => {
  const data = pluginData({cookie: {secure: false}});

  assert.equal(data.cookie.secure, false);
});

test('loads the shop client module', () => {
  const [clientModule] = createPlugin().getClientModules();

  assert.ok(clientModule.endsWith('src/clientModules/shop.js'));
  assert.ok(fs.existsSync(clientModule));
});

test('exposes the ShopifyAdminLink theme component', () => {
  const themePath = createPlugin().getThemePath();

  assert.ok(fs.existsSync(path.join(themePath, 'ShopifyAdminLink.jsx')));
});

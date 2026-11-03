const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const babel = require('@babel/core');

const PACKAGE_NAME = require('../package.json').name;

// Loads the JSX component as CommonJS so it can be rendered without a browser
// or a Docusaurus build. Hooks are stubbed; tests only inspect the element the
// component returns.
function loadComponent({shop = null} = {}) {
  const filename = path.join(__dirname, '../src/components/ShopifyAdminLink.jsx');
  const {code} = babel.transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    presets: [
      [require.resolve('@babel/preset-env'), {targets: {node: 'current'}}],
      [require.resolve('@babel/preset-react'), {runtime: 'automatic'}],
    ],
  });

  const stubs = {
    react: {
      useEffect() {},
      useState: () => [shop, () => {}],
    },
    'react/jsx-runtime': {
      jsx: (type, props) => ({type, props}),
      jsxs: (type, props) => ({type, props}),
    },
    '@docusaurus/useGlobalData': {
      __esModule: true,
      default: () => ({[PACKAGE_NAME]: {default: {cookie: {name: 'shop'}}}}),
    },
  };

  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (Object.hasOwn(stubs, request)) return stubs[request];
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const componentModule = new Module(filename, module);
    componentModule.filename = filename;
    componentModule.paths = Module._nodeModulePaths(path.dirname(filename));
    componentModule._compile(code, filename);
    return componentModule.exports.default;
  } finally {
    Module._load = originalLoad;
  }
}

test('builds a Shopify Admin URL from a relative path', () => {
  const ShopifyAdminLink = loadComponent({shop: 'example.myshopify.com'});
  const element = ShopifyAdminLink({href: 'orders', children: 'Orders'});

  assert.equal(element.type, 'a');
  assert.equal(element.props.href, 'https://example.myshopify.com/admin/orders');
  assert.equal(element.props.target, '_blank');
  assert.equal(element.props.rel, 'noopener noreferrer');
});

test('accepts an href function', () => {
  const ShopifyAdminLink = loadComponent({shop: 'example.myshopify.com'});
  const element = ShopifyAdminLink({
    href: (shopify) => shopify.themes(),
    children: 'Themes',
  });

  assert.equal(element.props.href, 'https://example.myshopify.com/admin/themes');
});

test('includes the leading slash only once', () => {
  const ShopifyAdminLink = loadComponent({shop: 'example.myshopify.com'});
  const expected = 'https://example.myshopify.com/admin/settings/shipping/order_routing';

  for (const href of [
    'settings/shipping/order_routing',
    '/settings/shipping/order_routing',
    '//settings/shipping/order_routing',
  ]) {
    assert.equal(ShopifyAdminLink({href}).props.href, expected);
  }
});

test('returns the Admin URL when the path is empty', () => {
  const ShopifyAdminLink = loadComponent({shop: 'example.myshopify.com'});

  assert.equal(
    ShopifyAdminLink({href: ''}).props.href,
    'https://example.myshopify.com/admin/'
  );
});

test('passes other props to the anchor element', () => {
  const ShopifyAdminLink = loadComponent({shop: 'example.myshopify.com'});
  const element = ShopifyAdminLink({
    href: 'orders',
    className: 'admin-link',
    id: 'orders-link',
    'aria-label': 'View orders',
    children: 'Orders',
  });

  assert.equal(element.props.className, 'admin-link');
  assert.equal(element.props.id, 'orders-link');
  assert.equal(element.props['aria-label'], 'View orders');
});

test('allows the target to be overridden', () => {
  const ShopifyAdminLink = loadComponent({shop: 'example.myshopify.com'});
  const element = ShopifyAdminLink({
    href: 'orders',
    target: '_self',
    children: 'Orders',
  });

  assert.equal(element.props.target, '_self');
});

test('renders plain text when no shop is known', () => {
  const ShopifyAdminLink = loadComponent();

  assert.equal(ShopifyAdminLink({href: 'orders', children: 'Orders'}), 'Orders');
});

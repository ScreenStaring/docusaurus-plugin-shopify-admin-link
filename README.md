# docusaurus-plugin-shopify-admin-link

A Docusaurus plugin that links to pages in the viewer's Shopify Admin.

The viewer's shop domain is read from a query string parameter, saved as a cookie, and used by the `ShopifyAdminLink` component to build links to the Shopify Admin.
If no query string parameter is given the text is rendered without a link. Links are built using the [shopify-url package](https://github.com/ScreenStaring/shopify-url).

## Install

```sh
npm install docusaurus-plugin-shopify-admin-link
```

## Configure

Add the plugin to `docusaurus.config.js`:

```js
plugins: [
  'shopify-admin-link'
]
```

This will look for a query string parameter named `shop` and save it to a session cookie named `shop`. For example:

```
https://example.com/docs?shop=some-store.myshopify.com
```

**Only values ending in `.myshopify.com` are saved**. Values that include a scheme or path, such as `https://some-store.myshopify.com`, are ignored.

To override the defaults:

```js
plugins: [
  [
    'shopify-admin-link',
    {
      shopParam: 'loja',
      cookie: {
        name: 'loja',
        // This expires after 30 days.
        expires: 60 * 60 * 24 * 30,
      },
    },
  ],
],
```

The plugin loads its client module and theme component automatically. Do not add `src/clientModules/shop.js` to the site's `clientModules` as well.

## Use the Component

```mdx
import ShopifyAdminLink from '@theme/ShopifyAdminLink';
```

Then generate some links. For example, to link to the Themes page in the Shopify Admin:
```mdx
Go to <ShopifyAdminLink href={(shopify) => shopify.themes()}>your Themes</ShopifyAdminLink> and do something
```

Or, to link to the orders page:

```mdx
Checkout <ShopifyAdminLink href={(shopify) => shopify.orders()}>your orders</ShopifyAdminLink>
```

The function receives a [`shopify-url`](https://github.com/ScreenStaring/shopify-url) `Admin` instance.

You can also pass a string path, which is resolved relative to the shop's Admin URL:
```mdx
<ShopifyAdminLink href="/settings/shipping/order_routing">Shopify Order Routing</ShopifyAdminLink>
```

The leading slash is optional, so both `href="orders"` and `href="/orders"` link to `https://SHOP.myshopify.com/admin/orders`.

When no shop is known, the component renders its children as plain text instead of a link.

Links open in a new tab by default (`target="_blank"`) and include `rel="noopener noreferrer"`. Pass `target` to override it, for example `target="_self"`.
Any other props, such as `className`, are passed to the link.

## Notes

`cookie.expires` is specified in seconds and set as an absolute expiry date on
the cookie. Each time the shop parameter is seen, the expiry is refreshed.

The cookie is marked `secure` by default, so it is only saved when the site is served over HTTPS. Set `cookie.secure` to `false` for sites served over plain HTTP, such as an intranet:

```js
cookie: {
  secure: false,
},
```

The plugin adds these dependencies to the site:

- `js-cookie`
- `shopify-url`

React and Docusaurus are peer dependencies supplied by the site.

---

Made by [ScreenStaring](https://screenstaring.com)

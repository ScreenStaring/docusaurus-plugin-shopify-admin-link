import {useEffect, useState} from 'react';
import useGlobalData from '@docusaurus/useGlobalData';
import {Admin} from 'shopify-url';
import Cookies from 'js-cookie';
import packageInfo from '../../package.json';

function useCookieName() {
  const globalData = useGlobalData();
  const pluginData = globalData[packageInfo.name] ?? {};
  // Docusaurus keys a plugin's data by plugin instance ID. "default" is the ID
  // of a plugin configured once; fall back to the first instance otherwise.
  const pluginOptions =
    pluginData.default ?? Object.values(pluginData)[0] ?? {};
  return pluginOptions.cookie?.name;
}

// Builds a URL to a page in the shop's Shopify Admin. The path may include a
// leading slash or not; exactly one slash is placed between the Admin URL and
// the path, so "orders" and "/orders" both produce:
//
//   https://example.myshopify.com/admin/orders
//
function shopifyAdminHref(shop, path) {
  return `${new Admin(shop)}/${String(path ?? '').replace(/^\/+/, '')}`;
}

// Renders children as a link to the viewer's Shopify Admin when a shop is
// known (see src/clientModules/shop.js); otherwise renders the plain text.
// `href` is either a path relative to the shop's Admin URL or a function
// receiving a shopify-url Admin instance and returning the URL, e.g.:
//
//   <ShopifyAdminLink href="/themes">Go to your Themes in the Shopify Admin</ShopifyAdminLink>
//
//   <ShopifyAdminLink href={(shopify) => shopify.themes()}>
//     Go to your Themes in the Shopify Admin
//   </ShopifyAdminLink>
//
// A leading slash in the path is optional. `target` defaults to "_blank".
// All other props are passed to the anchor element.
//
export default function ShopifyAdminLink(props) {
  const cookieName = useCookieName();
  const [shop, setShop] = useState(null);

  // Read the cookie after mount so the server-rendered text and the first
  // client render match. The cookie is read once: a component that stays
  // mounted across client-side navigations will not see a shop saved later by
  // src/clientModules/shop.js.
  useEffect(() => {
    if (cookieName) setShop(Cookies.get(cookieName));
  }, [cookieName]);

  const {href, target, children, ...rest} = props;

  if (!shop) return children;

  const adminHref =
    typeof href === 'function'
      ? href(new Admin(shop)).toString()
      : shopifyAdminHref(shop, href);

  return (
    <a
      href={adminHref}
      target={target ?? '_blank'}
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}

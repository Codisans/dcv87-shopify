import {HomeHeaderMenu} from './HomeHeaderMenu';

export const HomeFooter = ({header, isLoggedIn, cart, publicStoreDomain}) => {
  const {shop, menu} = header;
  return (
    <footer className="w-full flex-none">
      <HomeHeaderMenu
        menu={menu}
        primaryDomainUrl={shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
        flip={true}
      />
    </footer>
  );
};

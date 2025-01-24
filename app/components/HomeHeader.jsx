import {HomeHeaderMenu} from './HomeHeaderMenu';
export const HomeHeader = ({header, isLoggedIn, cart, publicStoreDomain}) => {
  const {shop, menu} = header;
  return (
    <header className="w-full flex-none">
      <HomeHeaderMenu
        menu={menu}
        primaryDomainUrl={shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
    </header>
  );
};

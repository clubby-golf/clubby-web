import { useState } from 'react';
import classNames from 'classnames';
import css from './NavbarDesktop.module.css';

export default function NavbarDesktop({ links = [], className }) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <nav className={classNames(css.navbar, className)}>
      <ul className={css.navList}>
        {links.map(item => (
          <li
            key={item.key}
            className={css.navItem}
            onMouseEnter={() => setOpenMenu(item.key)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <a href={item.href} className={css.navLink}>
              {item.label}
            </a>

            {item.children && (
              <ul
                className={classNames(css.dropdown, {
                  [css.show]: openMenu === item.key,
                })}
              >
                {item.children.map(child => (
                  <li key={child.key}>
                    <a href={child.href} className={css.dropdownItem}>
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

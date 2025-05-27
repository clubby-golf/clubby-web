import css from './SectionLandingPopularBrands.module.css';

const golfBrands = [
  { name: 'Titleist' },
  { name: 'Callaway' },
  { name: 'TaylorMade' },
  { name: 'PING' },
  { name: 'Mizuno' },
  { name: 'Cobra' },
  { name: 'Wilson' },
  { name: 'Nike Golf' },
  { name: 'Adidas Golf' },
  { name: 'Under Armour' },
  { name: 'FootJoy' },
  { name: 'Srixon' },
];

const featuredCategories = [
  {
    icon: '🏌️',
    title: 'Premium Clubs',
    description: 'Top-rated drivers, irons, and putters from leading manufacturers',
  },
  {
    icon: '👕',
    title: 'Golf Apparel',
    description: 'Performance wear and accessories from trusted golf brands',
  },
  {
    icon: '⛳',
    title: 'Golf Balls',
    description: 'Professional-grade golf balls for every skill level and playing style',
  },
];

export default function SectionLandingPopularBrands() {
  return (
    <section className={css.brandsSection}>
      <div className={css.container}>
        <div className={css.sectionHeader}>
          <h2 className={css.title}>Popular Brands</h2>
          <p className={css.subtitle}>
            Discover equipment and apparel from the most trusted names in golf. From tour-proven
            clubs to performance wear, we carry the brands that pros and amateurs love.
          </p>
        </div>

        <div className={css.featuredBrands}>
          {featuredCategories.map((category, index) => (
            <div key={index} className={css.featuredCard}>
              <div className={css.featuredIcon}>{category.icon}</div>
              <h3 className={css.featuredTitle}>{category.title}</h3>
              <p className={css.featuredDescription}>{category.description}</p>
            </div>
          ))}
        </div>

        <div className={css.brandsGrid}>
          {golfBrands.map((brand, index) => (
            <div key={index} className={css.brandCard}>
              <div className={css.brandName}>{brand.name}</div>
            </div>
          ))}
        </div>

        <div className={css.buttonContainer}>
          <button className={css.viewAllButton}>
            View All Brands
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

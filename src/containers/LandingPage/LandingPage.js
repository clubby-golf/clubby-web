import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { ASSET_NAME } from './LandingPage.duck';

// your two custom sections
import SectionLandingHero from '../PageBuilder/SectionBuilder/SectionLandingHero';
import SectionLandingPopularBrands from '../PageBuilder/SectionBuilder/SectionLandingPopularBrands';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const landingHeroType = SectionLandingHero.sectionType || 'landing-hero';
const landingPopularBrandsType =
  SectionLandingPopularBrands.sectionType || 'landing-popular-brands';

export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error } = props;

  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  // inject both hero and popular‐brands at the very top
  const customPageData = pageData
    ? {
        ...pageData,
        sections: [
          { sectionType: landingHeroType },
          { sectionType: landingPopularBrandsType },
          ...pageData.sections,
        ],
      }
    : pageData;

  return (
    <PageBuilder
      pageAssetsData={customPageData}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
      options={{
        sectionComponents: {
          [landingHeroType]: { component: SectionLandingHero },
          [landingPopularBrandsType]: { component: SectionLandingPopularBrands },
        },
      }}
    />
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  return { pageAssetsData, inProgress, error };
};

const LandingPage = compose(connect(mapStateToProps))(LandingPageComponent);
export default LandingPage;

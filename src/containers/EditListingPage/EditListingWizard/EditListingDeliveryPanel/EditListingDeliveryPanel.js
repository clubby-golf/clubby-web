import React, { useState } from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT, STOCK_MULTIPLE_ITEMS, propTypes } from '../../../../util/types';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../../util/configHelpers';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingDeliveryForm from './EditListingDeliveryForm';
import css from './EditListingDeliveryPanel.module.css';

const { Money } = sdkTypes;

const getInitialValues = props => {
  const { listing, listingTypes, marketplaceCurrency } = props;
  const { geolocation, publicData, price } = listing?.attributes || {};

  const listingType = listing?.attributes?.publicData?.listingType;
  const listingTypeConfig = listingTypes.find(conf => conf.listingType === listingType);
  const displayShipping = displayDeliveryShipping(listingTypeConfig);
  const displayPickup = displayDeliveryPickup(listingTypeConfig);
  const displayMultipleDelivery = displayShipping && displayPickup;

  // Only render current search if full place object is available in the URL params
  const locationFieldsPresent = publicData?.location?.address && geolocation;
  const location = publicData?.location || {};
  const { address, building } = location;
  const {
    shippingEnabled,
    pickupEnabled,
    shippingPriceInSubunitsOneItem,
    shippingPriceInSubunitsAdditionalItems,
    shippingResponsibility,
    packageWeight,
    packageLength,
    packageWidth,
    packageHeight,
  } = publicData;
  const deliveryOptions = [];

  if (shippingEnabled || (!displayMultipleDelivery && displayShipping)) {
    deliveryOptions.push('shipping');
  }
  if (pickupEnabled || (!displayMultipleDelivery && displayPickup)) {
    deliveryOptions.push('pickup');
  }

  const currency = price?.currency || marketplaceCurrency;
  const shippingOneItemAsMoney =
    shippingPriceInSubunitsOneItem != null
      ? new Money(shippingPriceInSubunitsOneItem, currency)
      : null;
  const shippingAdditionalItemsAsMoney =
    shippingPriceInSubunitsAdditionalItems != null
      ? new Money(shippingPriceInSubunitsAdditionalItems, currency)
      : null;

  // Initial values for the form
  return {
    building,
    location: locationFieldsPresent
      ? {
          search: address,
          selectedPlace: { address, origin: geolocation },
        }
      : { search: undefined, selectedPlace: undefined },
    deliveryOptions,
    shippingPriceInSubunitsOneItem: shippingOneItemAsMoney,
    shippingPriceInSubunitsAdditionalItems: shippingAdditionalItemsAsMoney,
    shippingResponsibility: shippingResponsibility || 'platform',
    packageWeight: packageWeight ?? '',
    packageLength: packageLength ?? '',
    packageWidth: packageWidth ?? '',
    packageHeight: packageHeight ?? '',
  };
};

/**
 * The EditListingDeliveryPanel component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {Array<Object>} props.listingTypes - The active listing types configs
 * @param {string} props.marketplaceCurrency - The marketplace currency (e.g. 'USD')
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {Function} props.onSubmit - The submit function
 * @param {string} props.submitButtonText - The submit button text
 * @param {boolean} props.panelUpdated - Whether the panel is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.errors - The errors object
 * @returns {JSX.Element}
 */
const EditListingDeliveryPanel = props => {
  // State is needed since LocationAutocompleteInput doesn't have internal state
  const [state, setState] = useState({ initialValues: getInitialValues(props) });

  const {
    className,
    rootClassName,
    listing,
    listingTypes,
    marketplaceCurrency,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes.state !== LISTING_STATE_DRAFT;
  const priceCurrencyValid = listing?.attributes?.price?.currency === marketplaceCurrency;
  const listingType = listing?.attributes?.publicData?.listingType;
  const listingTypeConfig = listingTypes.find(conf => conf.listingType === listingType);
  const hasStockInUse = listingTypeConfig.stockType === STOCK_MULTIPLE_ITEMS;

  return (
    <div className={classes}>
      <H3 as="h1">
        {isPublished ? (
          <FormattedMessage
            id="EditListingDeliveryPanel.title"
            values={{ listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> }}
          />
        ) : (
          <FormattedMessage
            id="EditListingDeliveryPanel.createListingTitle"
            values={{ lineBreak: <br /> }}
          />
        )}
      </H3>
      {priceCurrencyValid ? (
        <EditListingDeliveryForm
          className={css.form}
          initialValues={state.initialValues}
          onSubmit={values => {
            const {
              building = '',
              location,
              shippingPriceInSubunitsOneItem,
              shippingPriceInSubunitsAdditionalItems,
              deliveryOptions,
              shippingResponsibility,
              packageWeight,
              packageLength,
              packageWidth,
              packageHeight,
            } = values;

            const shippingEnabled = deliveryOptions.includes('shipping');
            const pickupEnabled = deliveryOptions.includes('pickup');
            const address = location?.selectedPlace?.address || null;
            const origin = location?.selectedPlace?.origin || null;

            const pickupDataMaybe =
              pickupEnabled && address ? { location: { address, building } } : {};

            // Build shipping data and clear opposite fields
            const shippingData = {};
            if (shippingEnabled) {
              if (shippingResponsibility === 'seller') {
                shippingData.shippingPriceInSubunitsOneItem =
                  shippingPriceInSubunitsOneItem?.amount ?? null;
                shippingData.shippingPriceInSubunitsAdditionalItems =
                  shippingPriceInSubunitsAdditionalItems?.amount ?? null;
                // clear package dimensions
                shippingData.packageWeight = null;
                shippingData.packageLength = null;
                shippingData.packageWidth = null;
                shippingData.packageHeight = null;
              } else if (shippingResponsibility === 'platform') {
                // clear seller shipping price fields
                shippingData.shippingPriceInSubunitsOneItem = null;
                shippingData.shippingPriceInSubunitsAdditionalItems = null;
                // set package dimensions
                shippingData.packageWeight = Number(packageWeight);
                shippingData.packageLength = Number(packageLength);
                shippingData.packageWidth = Number(packageWidth);
                shippingData.packageHeight = Number(packageHeight);
              }
            }

            // New values for listing attributes
            const updateValues = {
              geolocation: origin,
              publicData: {
                pickupEnabled,
                ...pickupDataMaybe,

                shippingEnabled,
                shippingResponsibility,

                ...shippingData,
              },
            };

            // Save the initialValues to state for reinitialization after submit
            setState({
              initialValues: {
                building,
                location: { search: address, selectedPlace: { address, origin } },
                deliveryOptions,
                shippingResponsibility,
                // Reflect cleared/updated shipping data
                shippingPriceInSubunitsOneItem:
                  shippingData.shippingPriceInSubunitsOneItem != null
                    ? new Money(shippingData.shippingPriceInSubunitsOneItem, marketplaceCurrency)
                    : null,
                shippingPriceInSubunitsAdditionalItems:
                  shippingData.shippingPriceInSubunitsAdditionalItems != null
                    ? new Money(
                        shippingData.shippingPriceInSubunitsAdditionalItems,
                        marketplaceCurrency
                      )
                    : null,
                packageWeight: shippingData.packageWeight ?? '',
                packageLength: shippingData.packageLength ?? '',
                packageWidth: shippingData.packageWidth ?? '',
                packageHeight: shippingData.packageHeight ?? '',
              },
            });

            onSubmit(updateValues);
          }}
          listingTypeConfig={listingTypeConfig}
          marketplaceCurrency={marketplaceCurrency}
          hasStockInUse={hasStockInUse}
          saveActionMsg={submitButtonText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          autoFocus
        />
      ) : (
        <div className={css.priceCurrencyInvalid}>
          <FormattedMessage
            id="EditListingPricingPanel.listingPriceCurrencyInvalid"
            values={{ marketplaceCurrency }}
          />
        </div>
      )}
    </div>
  );
};

export default EditListingDeliveryPanel;

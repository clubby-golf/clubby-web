import { useState, useEffect } from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';

import css from './ShippingRateSelector.module.css';

const ShippingRateSelectorComponent = props => {
  const {
    className,
    rootClassName,
    intl,
    onSelectRate,
    listing,
    deliveryAddress,
    disabled,
  } = props;

  const [rates, setRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shipmentId, setShipmentId] = useState(null);

  const classes = classNames(rootClassName || css.root, className);

  useEffect(() => {
    if (deliveryAddress && listing) {
      fetchShippingRates();
    }
  }, [deliveryAddress]);

  const fetchShippingRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const sellerAddress = listing.attributes.publicData.location || {};

      const requestBody = {
        addressFrom: {
          name: listing.author.attributes.profile.displayName,
          street1: sellerAddress.address || '',
          city: sellerAddress.city || '',
          state: sellerAddress.state || '',
          zip: sellerAddress.postal || '',
          country: sellerAddress.country || 'US',
        },
        addressTo: {
          name: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
          street1: deliveryAddress.streetAddress,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zip: deliveryAddress.postalCode,
          country: deliveryAddress.country || 'US',
        },
        parcels: [
          {
            length: listing.attributes.publicData.packageLength || '10',
            width: listing.attributes.publicData.packageWidth || '8',
            height: listing.attributes.publicData.packageHeight || '6',
            distance_unit: 'in',
            weight: listing.attributes.publicData.packageWeight || '2',
            mass_unit: 'lb',
          },
        ],
      };

      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rates');
      }

      setRates(data.rates);
      setShipmentId(data.shipmentId);
    } catch (err) {
      console.error('Error fetching shipping rates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRate = rate => {
    setSelectedRate(rate);

    const shippingPrice = {
      amount: Math.round(parseFloat(rate.amount) * 100),
      currency: rate.currency,
    };

    onSelectRate({
      rate,
      shipmentId,
      shippingPrice,
    });
  };

  if (loading) {
    return (
      <div className={classes}>
        <div className={css.loading}>
          <FormattedMessage id="ShippingRateSelector.loading" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes}>
        <p className={css.error}>
          <FormattedMessage id="ShippingRateSelector.error" values={{ error }} />
        </p>
      </div>
    );
  }

  if (rates.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={classes}>
      <h3 className={css.title}>
        <FormattedMessage id="ShippingRateSelector.title" />
      </h3>

      <div className={css.rates}>
        {rates.map(rate => {
          const isSelected = selectedRate?.id === rate.id;
          const rateClasses = classNames(css.rate, {
            [css.selectedRate]: isSelected,
          });

          return (
            <button
              key={rate.id}
              className={rateClasses}
              onClick={() => handleSelectRate(rate)}
              disabled={disabled}
              type="button"
            >
              <div className={css.rateContent}>
                <div className={css.carrierInfo}>
                  {rate.carrierImage && (
                    <img src={rate.carrierImage} alt={rate.provider} className={css.carrierImage} />
                  )}
                  <div className={css.serviceInfo}>
                    <span className={css.carrier}>{rate.provider}</span>
                    <span className={css.service}>{rate.serviceName}</span>
                    {rate.estimatedDays && (
                      <span className={css.delivery}>
                        <FormattedMessage
                          id="ShippingRateSelector.estimatedDays"
                          values={{ days: rate.estimatedDays }}
                        />
                      </span>
                    )}
                  </div>
                </div>
                <div className={css.price}>
                  {formatMoney(intl, {
                    amount: Math.round(parseFloat(rate.amount) * 100),
                    currency: rate.currency,
                  })}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

ShippingRateSelectorComponent.defaultProps = {
  className: null,
  rootClassName: null,
  disabled: false,
};

ShippingRateSelectorComponent.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  onSelectRate: func.isRequired,
  listing: object.isRequired,
  deliveryAddress: object,
  disabled: bool,
};

const ShippingRateSelector = injectIntl(ShippingRateSelectorComponent);

export default ShippingRateSelector;

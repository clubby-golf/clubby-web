const { Shippo } = require('shippo');
const { getSdk } = require('../api-util/sdk');

// Initialize Shippo with API key
const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY,
});

// Get shipping rates
exports.getShippingRates = async (req, res) => {
  try {
    const { addressFrom, addressTo, parcels } = req.body;

    // Verify user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create shipment to get rates using new Shippo SDK
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: addressFrom.name,
        street1: addressFrom.street1,
        city: addressFrom.city,
        state: addressFrom.state,
        zip: addressFrom.zip,
        country: addressFrom.country,
        email: addressFrom.email || '',
        phone: addressFrom.phone || '',
      },
      addressTo: {
        name: addressTo.name,
        street1: addressTo.street1,
        city: addressTo.city,
        state: addressTo.state,
        zip: addressTo.zip,
        country: addressTo.country,
        email: addressTo.email || '',
        phone: addressTo.phone || '',
      },
      parcels: parcels.map(parcel => ({
        length: parcel.length,
        width: parcel.width,
        height: parcel.height,
        distanceUnit: parcel.distance_unit || 'in',
        weight: parcel.weight,
        massUnit: parcel.mass_unit || 'lb',
      })),
      async: false,
    });

    // Format rates for frontend
    const rates = shipment.rates
      .filter(rate => rate.available)
      .map(rate => ({
        id: rate.objectId,
        provider: rate.provider,
        serviceName: rate.servicelevel.name,
        estimatedDays: rate.estimatedDays,
        amount: rate.amount,
        currency: rate.currency,
        carrierImage: rate.providerImage75,
      }))
      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));

    res.json({
      rates,
      shipmentId: shipment.objectId,
    });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    res.status(500).json({ error: 'Failed to fetch shipping rates' });
  }
};

// Create shipping label (called via webhook or Integration API)
exports.createShippingLabel = async (req, res) => {
  try {
    const { transactionId, rateId, shipmentId } = req.body;

    // Initialize Integration SDK
    const integrationSdk = getSdk(req, res, {
      clientId: process.env.SHARETRIBE_INTEGRATION_CLIENT_ID,
      clientSecret: process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET,
      useCookieToken: false,
    });

    // Fetch transaction details
    const transactionResponse = await integrationSdk.transactions.show({
      id: transactionId,
      include: ['provider', 'customer', 'listing'],
    });

    const transaction = transactionResponse.data.data;
    const included = transactionResponse.data.included;

    // Find provider details
    const provider = included.find(
      item =>
        item.type === 'user' && item.id.uuid === transaction.relationships.provider.data.id.uuid
    );

    // Get shipment details first
    const shipment = await shippo.shipments.get(shipmentId);

    // Purchase shipping label using new SDK format
    const transactionCreate = await shippo.transactions.create({
      rate: rateId,
      labelFileType: 'PDF',
      async: false,
    });

    if (transactionCreate.status !== 'SUCCESS') {
      throw new Error('Failed to create shipping label');
    }

    // Update transaction with shipping info
    await integrationSdk.transactions.updateMetadata({
      id: transactionId,
      metadata: {
        shipping: {
          trackingNumber: transactionCreate.trackingNumber,
          labelUrl: transactionCreate.labelUrl,
          carrier: transactionCreate.rate.provider,
          service: transactionCreate.rate.servicelevel.name,
          labelCreatedAt: new Date().toISOString(),
        },
      },
    });

    // Send email to provider
    await sendShippingLabelEmail({
      recipientEmail: provider.attributes.email,
      recipientName: provider.attributes.profile.displayName,
      labelUrl: transactionCreate.labelUrl,
      trackingNumber: transactionCreate.trackingNumber,
      carrier: transactionCreate.rate.provider,
      service: transactionCreate.rate.servicelevel.name,
      transactionId: transactionId,
      shipTo: shipment.addressTo,
    });

    res.json({
      success: true,
      trackingNumber: transactionCreate.trackingNumber,
    });
  } catch (error) {
    console.error('Error creating shipping label:', error);
    res.status(500).json({ error: 'Failed to create shipping label' });
  }
};

// Get tracking information
exports.getTracking = async (req, res) => {
  try {
    const { trackingNumber, carrier } = req.params;

    const tracking = await shippo.trackingStatus.get(carrier, trackingNumber);

    res.json({
      success: true,
      tracking: {
        status: tracking.trackingStatus?.status,
        statusDetails: tracking.trackingStatus?.statusDetails,
        statusDate: tracking.trackingStatus?.statusDate,
        location: tracking.trackingStatus?.location,
        estimatedDelivery: tracking.eta,
        trackingHistory: tracking.trackingHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({ error: 'Failed to fetch tracking information' });
  }
};

// Email sending function
const sendShippingLabelEmail = async params => {
  const {
    recipientEmail,
    recipientName,
    labelUrl,
    trackingNumber,
    carrier,
    service,
    transactionId,
    shipTo,
  } = params;

  // Here you would integrate with your email service
  // Example structure for SendGrid, AWS SES, etc.
  const emailContent = {
    to: recipientEmail,
    subject: `Shipping Label Ready - Order #${transactionId.substr(0, 8)}`,
    html: `
      <h2>Hi ${recipientName},</h2>
      <p>Your shipping label is ready! A customer has completed payment for their order.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Shipping Details:</h3>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Carrier:</strong> ${carrier}</p>
        <p><strong>Service:</strong> ${service}</p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Ship To:</h3>
        <p>
          ${shipTo.name}<br>
          ${shipTo.street1}<br>
          ${shipTo.street2 ? shipTo.street2 + '<br>' : ''}
          ${shipTo.city}, ${shipTo.state} ${shipTo.zip}<br>
          ${shipTo.country}
        </p>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${labelUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Download Shipping Label (PDF)
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        Please print this label and attach it to your package. Ship within 24 hours to ensure timely delivery.
        The label link will expire in 30 days.
      </p>
    `,
  };

  // Implement your email sending logic here
  console.log('Sending shipping label email:', emailContent);
};

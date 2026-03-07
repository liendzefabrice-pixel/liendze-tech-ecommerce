import type { Schema, Struct } from '@strapi/strapi';

export interface OrderDeliveryInfo extends Struct.ComponentSchema {
  collectionName: 'components_order_delivery_infos';
  info: {
    description: 'Customer delivery and contact details for an order';
    displayName: 'delivery-info';
  };
  attributes: {
    address: Schema.Attribute.Text & Schema.Attribute.Required;
    city: Schema.Attribute.String & Schema.Attribute.Required;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    full_name: Schema.Attribute.String & Schema.Attribute.Required;
    notes: Schema.Attribute.Text;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'order.delivery-info': OrderDeliveryInfo;
    }
  }
}

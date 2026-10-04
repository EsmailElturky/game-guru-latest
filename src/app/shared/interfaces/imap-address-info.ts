export interface IMapAddressInfo {
  display_name: string;
  address: {
    country?: string;
    country_code?: string;
    house_number?: string;
    postcode?: string;
    road?: string;
    state?: string;
    town?: string;
  };
}

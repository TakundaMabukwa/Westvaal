// Client-related types based on WestvaalController.cs structure

export interface WestvaalClient {
  id?: number;
  companyInformation: CompanyInformation;
  physicalAddress: Address;
  postalAddress?: Address;
  contactDetails: ContactDetail[];
  businessTypes: BusinessType;
  fleetSizeInformation: FleetSizeInformation[];
}

export interface CompanyInformation {
  id?: number;
  name: string;
  registrationNumber: string;
  vatNumber: string;
  taxNumber?: string;
  kycCompliant: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  id?: number;
  addressTypeId: number; // 1 = Physical, 2 = Postal
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ContactDetail {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  isPrimary: boolean;
}

export interface BusinessType {
  id?: number;
  name: string;
  description?: string;
}

export interface FleetSizeInformation {
  id?: number;
  vehicleType: string;
  currentQuantity: number;
  plannedQuantity: number;
  notes?: string;
}

export interface ClientRegistration {
  id?: number;
  companyId: number;
  physicalAddressId: number;
  postalAddressId?: number;
  businessTypeId: number;
  contactDetailsId: number[];
  fleetSizeInformationId: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

// For API responses and listings
export interface ClientSummary {
  id: number;
  name: string;
  registrationNumber: string;
  vatNumber: string;
  kycCompliant: boolean;
  primaryContact?: string;
  primaryEmail?: string;
  fleetSize?: number;
  businessType?: string;
}
// Order status for Kanban board
export enum OrderStatus {
  NEW_ORDERS = 'new_orders',
  AWAITING_DELIVERY = 'awaiting_delivery',
  PRE_DELIVERY_INSPECTION = 'pre_delivery_inspection',
  AWAITING_BANK = 'awaiting_bank',
  COMPLETED = 'completed'
}

// Trade-in details
export interface TradeInDetails {
  tradeInPrice: number;
  settlement: number;
  deposit: number;
  cashback: number;
  depositTowardsPurchase: number;
  owner?: {
    title?: string;
    firstName?: string;
    lastName?: string;
    idNumber?: string;
    contactNumber?: string;
    email?: string;
    companyName?: string;
    unitDoorNo?: string;
    complexName?: string;
    streetHouseNo?: string;
    streetName?: string;
    suburb?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  vehicle?: {
    manualVehicle?: boolean;
    appraisalNo?: string;
    meadMcGrouther?: string;
    category?: string;
    make?: string;
    model?: string;
    variant?: string;
    year?: string;
    colour?: string;
    regNo?: string;
    mileage?: string;
    chassisNo?: string;
    engineNo?: string;
    purchasedFrom?: string;
    financeCompany?: string;
    insuranceCompany?: string;
    policyNo?: string;
    settlementExpDate?: string;
    nextInstallmentDate?: string;
    comments?: string;
    mmRetailValue?: number;
    mmTradeValue?: number;
    mmCode?: string;
  };
  offer?: {
    offerByDealer?: number;
    standInPriceEstimated?: number;
    standInPrice?: number;
    lessSettlement?: number;
    balanceShortage?: number;
    shortfallRecovery?: number;
    customerContribution?: number;
    addOnA?: number;
    vatApplicable?: boolean;
    surplusApplication?: number;
    lessCashBack?: number;
    lessDepositTowardsPurchase?: number;
    nettBalance?: number;
  };
}

// Main quote structure
export interface WestvaalQuote {
  id?: string | number;
  parts: DtoPart[];
  customerDetails: DtoCustomerDetails;
  email: DtoEmail;
  status: QuoteStatus | OrderStatus;
  bankRef?: string;
  tradeIn?: TradeInDetails;
  // Workflow stages for post-creation management
  workflowStages?: QuoteWorkflowStages;
}

// Parts and accessories
export interface DtoPart {
  quantity: number;
  masterPrice: number;
  masterDiscount: number;
  price: number;
  accessories: DtoAccessory[];
  product: DtoProduct;
}

export interface DtoAccessory {
  quantity: number;
  masterPrice: number;
  masterDiscount: number;
  price: number;
  product: DtoProduct;
}

// Product (Vehicle) information
export interface DtoProduct {
  id: number;
  mmCode: string;
  name: string;
  description: string;
  cost: number;
  retail: number;
  maxDiscount: number;
  isActive: boolean;
  basicVehicleInformation: DtoBasicVehicleInformation;
  specifications: DtoSpecifications;
  finance: DtoFinance;
  warranty: DtoWarranty;
  additionalFeatures: DtoAdditionalFeatures;
}

// Vehicle details
export interface DtoBasicVehicleInformation {
  mmCode: string;
  make: string;
  model: string;
  type: string;
}

export interface DtoSpecifications {
  mmCode: string;
  cubicCapacity: number;
  kilowatt: number;
  newtonMeter: number;
  co2Emissions: number;
  fuelTypeId: number;
  fuelConsumption: number;
  period: number;
  kmsPerMonth: number;
  totalKms: number;
  retail: number;
  fuelType: string;
}

export interface DtoFinance {
  mmCode: string;
  financePerMonth: number;
  rv: number;
  rvPercentage: number;
  totalFinance: number;
  resale: number;
  maintenance: number;
  tyres: number;
  fuel: number;
  insurance: number;
  operatingCostPerMonth: number;
  operatingCostPerKilometre: number;
  totalCostPerMonth: number;
  totalCostPerKilometre: number;
  totalCostOverall: number;
}

export interface DtoWarranty {
  mmCode: string;
  warrantyMonths: number;
  warrantyKilometers: number;
  planTypeId: number;
  planMonths: number;
  planKilometers: number;
  planType: string;
}

export interface DtoAdditionalFeatures {
  mmCode: string;
  hasAbs: boolean;
  hasAirbags: boolean;
  hasAircon: boolean;
  hasAlloyWheels: boolean;
  hasCruiseControl: boolean;
  hasDiffLock: boolean;
  hasElectricWindows: boolean;
  hasLowRatio: boolean;
  hasPdc: boolean;
  hasPowerSteering: boolean;
  hasSatNav: boolean;
  hasSecurity: boolean;
  hasTraction: boolean;
}

// Customer and email
export interface DtoCustomerDetails {
  quoteTo: string;
  companyName: string;
  emailAddress: string;
  contactNumber: string;
}

export interface DtoEmail {
  footer: string;
  subject: string;
  body: string;
}

// Database entities
export interface QuoteJson {
  id: number;
  json: string;
  created_at?: string;
  updated_at?: string;
}

export interface FleetAssist {
  id: number;
  name: string;
  make: string;
  discount: number;
  n?: string;
}

// Quote lifecycle statuses
export enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  CLIENT_APPROVED = "client_approved",
  AWAITING_BANK_REF = "awaiting_bank_ref",
  AWAITING_INSPECTION = "awaiting_inspection",
  PRE_DELIVERY_JOB_CARD = "pre_delivery_job_card",
  APPLY_FOR_FINANCE = "apply_for_finance",
  WAITING_FOR_STOCK = "waiting_for_stock",
  LICENSE_AND_REG = "license_and_reg",
  COMPLETED = "completed"
}

// Workflow stages for post-creation quote management
export interface QuoteWorkflowStages {
  approveQuote?: {
    completed: boolean
    approvedBy?: string
    approvedAt?: string
    notes?: string
  }
  preDeliveryJobCard?: {
    completed: boolean
    documentUrl?: string
    uploadedAt?: string
    notes?: string
  }
  applyForFinance?: {
    completed: boolean
    bankReferenceNumber?: string
    appliedAt?: string
    approvedAt?: string
    notes?: string
  }
  waitingForStock?: {
    completed: boolean
    expectedDate?: string
    receivedDate?: string
    oemReference?: string
    notes?: string
  }
  licenseAndReg?: {
    completed: boolean
    licensePlate?: string
    registrationNumber?: string
    completedAt?: string
    notes?: string
  }
}

// Search and filtering
export interface DtoSearchDetails {
  make: string[];
}

// MM (Make/Model) DTO for vehicle creation
export interface Mmdto {
  BasicVehicleInformation: DtoBasicVehicleInformation;
  Specifications: DtoSpecifications;
  Finance: DtoFinance;
  Warranty: DtoWarranty;
  AdditionalFeatures: DtoAdditionalFeatures;
}

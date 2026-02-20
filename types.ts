// src/types/api.types.ts

export enum UserRole {
  DRIVER = 'DRIVER',
  OFFICER = 'OFFICER'
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export enum CrossingDirection {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT'
}

export enum CrossingResult {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL'
}

export enum DocumentType {
  LOG_CARD = 'LOG_CARD',
  INSURANCE = 'INSURANCE',
  ID = 'ID'
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  maskedId: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  plate_no: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  insurance_expiry: string;
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  vehicleId: string;
  status: ApplicationStatus;
  paymentStatus?: PaymentStatus;
  submittedAt?: string;
  reviewedAt?: string;
  decisionReason?: string;
  expiryDate?: string;
  createdAt: string;
  documents: DocumentMetadata[];
}

export interface DocumentMetadata {
  id: string;
  applicationId: string;
  type: DocumentType;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Crossing {
  id: string;
  permitId: string;
  vehicleId: string;
  userId: string;
  direction: CrossingDirection;
  checkpoint: string;
  timestamp: string;
  result: CrossingResult;
  failReason?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// API Response types
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

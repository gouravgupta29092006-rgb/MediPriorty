export type Role = 'ADMIN' | 'DISPATCHER' | 'MEDICAL_OFFICER';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Patient {
  patientId: number;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  contactNumber?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus =
  | 'PENDING_TRIAGE'
  | 'TRIAGED'
  | 'AMBULANCE_DISPATCHED'
  | 'ARRIVED'
  | 'BED_RESERVED'
  | 'ADMITTED'
  | 'CLOSED'
  | 'CANCELLED';

export type BedType = 'GENERAL' | 'EMERGENCY' | 'ICU';

export interface EmergencyRequest {
  requestId: number;
  requestNumber: string;
  requestStatus: RequestStatus;
  patientId: number;
  patientName: string;
  pickupLocation: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  requiredBedType?: BedType;
  currentTriageCategory?: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  createdAt: string;
  updatedAt: string;
}

export type TriageCategory = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export interface TriageRecord {
  triageId: number;
  requestId: number;
  requestNumber: string;
  patientName: string;
  triageCategory: TriageCategory;
  priorityValue: number;
  clinicalNotes?: string;
  vitalSignsJson?: string;
  assessmentVersion: number;
  assessedByOfficer: string;
  assessedAt: string;
}

export interface QueueEntry {
  requestId: number;
  requestNumber: string;
  patientName: string;
  triageCategory: TriageCategory;
  priorityValue: number;
  requestStatus: string;
  registeredAt: string;
  version: number;
}

export type AmbulanceType = 'BASIC' | 'ADVANCED' | 'CRITICAL_CARE';
export type EquipmentLevel = 'BLS' | 'ALS' | 'CRITICAL';
export type AmbulanceStatus = 'AVAILABLE' | 'RESERVED' | 'DISPATCHED' | 'ON_SCENE' | 'RETURNING' | 'MAINTENANCE';

export interface Ambulance {
  ambulanceId: number;
  registrationNumber: string;
  ambulanceType: AmbulanceType;
  equipmentLevel: EquipmentLevel;
  availableMedicalPersonnel: number;
  currentStatus: AmbulanceStatus;
  currentNodeId?: number;
  currentNodeName?: string;
  updatedAt: string;
}

export type BedStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';

export interface Bed {
  bedId: number;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  departmentId: number;
  departmentName: string;
  updatedAt: string;
}

export interface AmbulanceAllocation {
  allocationId: number;
  requestId: number;
  requestNumber: string;
  patientName: string;
  ambulanceId: number;
  ambulanceRegistration: string;
  ambulanceType: string;
  allocatedBy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  dispatchTime: string;
  arrivalTime?: string;
  completionTime?: string;
  createdAt: string;
}

export interface BedAllocation {
  allocationId: number;
  requestId: number;
  requestNumber: string;
  patientName: string;
  bedId: number;
  bedNumber: string;
  bedType: string;
  departmentName: string;
  allocatedBy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  reservedAt: string;
  admittedAt?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  logId: number;
  user?: {
    userId: number;
    fullName: string;
    email: string;
    role: Role;
  };
  action: string;
  entityType: string;
  entityId?: number;
  detailsJson?: string;
  createdAt: string;
}

export interface DashboardStats {
  activeEmergencyRequests: number;
  pendingTriageCount: number;
  triagedQueueCount: number;
  availableAmbulances: number;
  totalAmbulances: number;
  availableBeds: number;
  totalBeds: number;
  redPriorityCount: number;
  orangePriorityCount: number;
  yellowPriorityCount: number;
  greenPriorityCount: number;
}

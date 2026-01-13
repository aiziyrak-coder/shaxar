
export enum SensorStatus {
  OPTIMAL = 'OPTIMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface Coordinate {
  lat: number;
  lng: number;
}

// standalone DeviceHealth interface
export interface DeviceHealth {
  batteryLevel: number;
  signalStrength: number;
  lastPing: string;
  firmwareVersion: string;
  isOnline: boolean;
}

export interface IoTDevice {
  id: string;
  deviceId: string;
  deviceType: 'TEMPERATURE_SENSOR' | 'HUMIDITY_SENSOR' | 'BOTH';
  roomId?: string;
  boilerId?: string;
  location: Coordinate;
  lastSeen: string;
  isActive: boolean;
  createdAt: string;
  current_temperature?: number;
  current_humidity?: number;
  last_sensor_update?: string;
}

export interface WasteBin {
  id: string;
  location: Coordinate;
  address: string;
  tozaHudud: string;
  fillLevel: number;
  fillRate: number;
  lastAnalysis: string;
  imageUrl: string;
  imageSource?: 'CCTV' | 'BOT'; // Yangi maydon
  cameraUrl?: string; 
  googleMapsUrl?: string;
  isFull: boolean;
  deviceHealth: DeviceHealth;
  qrCodeUrl?: string;
  image?: string;
  organizationId?: string;
  trend?: { timestamp: string; fillLevel: number; isFull: boolean; source: string }[];
}

export type TozaHududType = '1-sonli Toza Hudud' | '2-sonli Toza Hudud';

export interface Truck {
  id: string;
  driverName: string;
  plateNumber: string; // Yangi: Mashina raqami
  tozaHudud: TozaHududType;
  location: Coordinate;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  fuelLevel: number;
  phone: string;
  login?: string;
  password?: string;
}

export type Tab = 'DASHBOARD' | 'ANALYTICS' | 'MOISTURE' | 'CLIMATE' | 'WASTE' | 'ECO_CONTROL' | 'AIR' | 'SECURITY' | 'CONSTRUCTION' | 'LIGHT_INSPECTOR' | 'TRANSPORT' | 'CALL_CENTER' | 
  'WASTE_REPORTS' | 'WASTE_TASKS' | 'WASTE_ROUTES' | 'WASTE_PREDICTION' | 
  'CLIMATE_REALTIME' | 'CLIMATE_SCHEDULER' | 'CLIMATE_AUTO' | 'CLIMATE_ENERGY' | 'CLIMATE_REPORTS' | 'ALERTS';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'DISPATCHER' | 'TECHNICIAN' | 'DRIVER' | 'ORGANIZATION';

export interface District {
  id: string;
  name: string;
  center: Coordinate;
}

export interface Region {
  id: string;
  name: string;
  districts: District[];
}

export interface UserSession {
  user: {
    name: string;
    role: UserRole;
    organizationId?: string;
  };
  region: Region;
  district: District;
  enabledModules: string[]; 
}

export interface MoistureSensor {
  id: string;
  location: Coordinate;
  mfy: string;
  status: SensorStatus;
  moistureLevel: number;
  lastUpdate: string;
}

export interface Room {
  id: string;
  name: string;
  facilityId?: string;
  floor?: number;
  capacity?: number;
  isOccupied?: boolean;
  targetHumidity: number;
  humidity: number;
  temperature?: number;
  status: SensorStatus;
  trend: number[];
  createdAt?: string;
  lastUpdated?: string;
}

export interface Boiler {
  id: string;
  name: string;
  targetHumidity: number;
  humidity: number;
  temperature?: number;
  status: SensorStatus;
  trend: number[];
  deviceHealth: DeviceHealth;
  connectedRooms: Room[];
  createdAt?: string;
  lastUpdated?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'SCHOOL' | 'KINDERGARTEN' | 'HOSPITAL';
  mfy: string;
  overallStatus: SensorStatus;
  energyUsage: number;
  efficiencyScore: number;
  managerName: string;
  lastMaintenance: string;
  history: number[];
  boilers: Boiler[];
  organizationId?: string;
}

export interface AirSensor {
  id: string;
  name: string;
  mfy: string;
  location: Coordinate;
  aqi: number;
  pm25: number;
  co2: number;
  status: SensorStatus;
}

export interface SOSColumn {
  id: string;
  name: string;
  location: Coordinate;
  mfy: string;
  status: 'IDLE' | 'ACTIVE';
  cameraUrl: string;
  lastTest: string;
  deviceHealth: DeviceHealth;
  activeIncident?: {
    aiAnalysis: {
      confidence: number;
      stressLevel: number;
      detectedObjects: string[];
      keywords: string[];
    };
  };
}

export interface EcoViolation {
  id: string;
  locationName: string;
  mfy: string;
  timestamp: string;
  imageUrl: string;
  confidence: number;
  offender?: {
    name: string;
    faceId: string;
    faceImageUrl: string;
    matchScore: number;
    estimatedAge: number;
    gender: 'MALE' | 'FEMALE';
  };
}

export type ConstructionStage = 'KOTLOVAN' | 'FUNDAMENT' | 'KARKAS_1' | 'KARKAS_FULL' | 'TOM_YOPISH' | 'PARDOZLASH';

export interface ConstructionMission {
  id: string;
  stageName: string;
  stageType: ConstructionStage;
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  progress: number;
}

export interface ConstructionSite {
  id: string;
  name: string;
  address: string;
  contractorName: string;
  cameraUrl: string;
  startDate: string;
  status: 'ON_TRACK' | 'WARNING' | 'CRITICAL';
  overallProgress: number;
  currentAiStage: ConstructionStage;
  aiConfidence: number;
  detectedObjects: { workers: number; cranes: number; trucks: number };
  missions: ConstructionMission[];
  history: { date: string; imageUrl: string; stage: string }[];
}

export type LightStatus = 'ON' | 'OFF' | 'FLICKERING';

export interface LightROI {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface LightPole {
  id: string;
  location: Coordinate;
  address: string;
  cameraUrl: string;
  status: LightStatus;
  luminance: number;
  lastCheck: string;
  rois: LightROI[];
}

export interface Bus {
  id: string;
  routeNumber: string;
  plateNumber: string;
  driverName: string;
  location: Coordinate;
  bearing: number;
  speed: number;
  rpm: number;
  passengers: number;
  status: 'ON_TIME' | 'DELAYED' | 'SOS' | 'STOPPED';
  fuelLevel: number;
  engineTemp: number;
  doorStatus: 'OPEN' | 'CLOSED';
  cabinTemp: number;
  driverHeartRate: number;
  driverFatigueLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  nextStop: string;
  cctvUrls: {
    front: string;
    driver: string;
    cabin: string;
  };
}

export type RequestCategory = 'HEALTH' | 'INTERIOR' | 'WASTE' | 'ELECTRICITY' | 'WATER' | 'GAS' | 'OTHER';

export interface CallRequest {
  id: string;
  citizenName: string;
  phone: string;
  transcript: string;
  category: RequestCategory;
  status: 'NEW' | 'ASSIGNED' | 'PROCESSING' | 'RESOLVED' | 'CLOSED';
  timestamp: string;
  address?: string;
  mfy: string;
  aiSummary: string;
  keywords: string[];
  citizenTrustScore: number;
  assignedOrg?: string;
  deadline?: string;
  timeline: {
    step: string;
    timestamp: string;
    actor: string;
    status: 'DONE' | 'PENDING';
  }[];
}

export interface ResponsibleOrg {
  id: string;
  name: string;
  type: string;
  activeBrigades: number;
  totalBrigades: number;
  currentLoad: number;
  contactPhone: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'HOKIMIYAT' | 'AGENCY' | 'ENTERPRISE';
  regionId: string;
  districtId: string;
  login: string;
  password?: string;
  enabledModules: string[];
  center: Coordinate;
}

export interface ModuleDefinition {
  id: string;
  label: string;
  icon: any;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  read: boolean;
}

export interface ChartData {
  label: string;
  data: { label: string; value: number; predicted?: number }[];
}

export interface ReportEntry {
  id: string;
  timestamp: string;
  mfy: string;
  locationName: string;
  category: string;
  metricLabel: string;
  value: string | number;
  costImpact?: string;
  status: SensorStatus;
  responsible: string;
}

export interface Weather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherForecast {
  day: string;
  temp: number;
  icon: string;
}

export type UtilityType = 'ELECTRICITY' | 'WATER' | 'GAS';

export interface UtilityNode {
  id: string;
  name: string;
  type: UtilityType;
  mfy: string;
  address: string;
  location: Coordinate;
  status: 'ACTIVE' | 'WARNING' | 'OUTAGE' | 'MAINTENANCE';
  load: number;
  capacity: string;
  activeTickets: number;
}

// ==================== NEW TYPES FOR ENHANCED FUNCTIONALITY ====================

export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'TIMEOUT';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface WasteTask {
  id: string;
  wasteBinId: string;
  wasteBin?: WasteBin;
  assignedTruckId?: string;
  assignedTruck?: Truck;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
}

export interface RouteOptimization {
  id: string;
  truckId: string;
  truck?: Truck;
  waypoints: string[]; // Array of bin IDs in optimal order
  totalDistance: number; // km
  estimatedTime: number; // minutes
  fuelEstimate: number; // liters
  createdAt: string;
  isActive: boolean;
  completedAt?: string;
}

export type AlertType = 'WASTE_BIN_FULL' | 'TEMPERATURE_CRITICAL' | 'HUMIDITY_CRITICAL' | 
                        'DEVICE_OFFLINE' | 'TASK_TIMEOUT' | 'FUEL_LOW' | 'MAINTENANCE_DUE' | 'ENERGY_SPIKE';
export type AlertChannel = 'APP' | 'SMS' | 'EMAIL' | 'TELEGRAM' | 'PUSH';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertNotification {
  id: string;
  alertType: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  channel: AlertChannel;
  recipient: string; // phone, email, or user ID
  isSent: boolean;
  sentAt?: string;
  createdAt: string;
  relatedWasteBinId?: string;
  relatedFacilityId?: string;
  relatedTruckId?: string;
}

export type ScheduleAction = 'INCREASE_TEMP' | 'DECREASE_TEMP' | 'MAINTAIN_TEMP' | 
                              'INCREASE_HUMIDITY' | 'DECREASE_HUMIDITY' | 'SHUTDOWN';

export interface ClimateSchedule {
  id: string;
  facilityId: string;
  facility?: Facility;
  boilerId?: string;
  boiler?: Boiler;
  name: string;
  daysOfWeek: string[]; // ['MON', 'TUE', ...]
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  action: ScheduleAction;
  targetTemperature?: number;
  targetHumidity?: number;
  isActive: boolean;
  createdAt: string;
}

export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface EnergyReport {
  id: string;
  facilityId: string;
  facility?: Facility;
  reportType: ReportType;
  startDate: string;
  endDate: string;
  totalEnergyKwh: number;
  totalCost: number;
  averageTemperature: number;
  averageHumidity: number;
  efficiencyScore: number;
  costSavings: number;
  recommendations: string;
  generatedAt: string;
  generatedBy: string;
}

export interface WastePrediction {
  id: string;
  wasteBinId: string;
  wasteBin?: WasteBin;
  predictionDate: string;
  predictedFillLevel: number;
  confidence: number;
  willBeFull: boolean;
  recommendedCollectionDate?: string;
  basedOnDataPoints: number;
  createdAt: string;
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';

export interface MaintenanceSchedule {
  id: string;
  facilityId: string;
  facility?: Facility;
  boilerId?: string;
  boiler?: Boiler;
  scheduledDate: string;
  completionDate?: string;
  status: MaintenanceStatus;
  taskDescription: string;
  assignedTechnician?: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
}

export interface DriverPerformance {
  id: string;
  truckId: string;
  truck?: Truck;
  date: string;
  binsCollected: number;
  totalDistance: number; // km
  totalTime: number; // minutes
  fuelUsed: number; // liters
  tasksCompleted: number;
  tasksRejected: number;
  averageResponseTime: number; // seconds
  rating: number; // 1-5
}

export interface WasteStatistics {
  totalBins: number;
  fullBins: number;
  averageFillLevel: number;
  totalTrucks: number;
  activeTrucks: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksInProgress: number;
  collectionEfficiency: number;
  byHudud: {
    [key: string]: {
      total: number;
      full: number;
      avgFill: number;
    };
  };
}

export interface ClimateStatistics {
  totalFacilities: number;
  totalRooms: number;
  totalBoilers: number;
  averageTemperature: number;
  averageHumidity: number;
  criticalRooms: number;
  warningRooms: number;
  optimalRooms: number;
  byFacilityType: {
    [key: string]: {
      count: number;
      avgEfficiency: number;
    };
  };
}

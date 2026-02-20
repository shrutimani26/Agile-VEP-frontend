
import { 
  User, UserRole, Vehicle, Application, ApplicationStatus, 
  Crossing, Notification, CrossingDirection 
} from '../types';

const DB_KEY = 'vep_fastpass_db';

interface DBStore {
  users: User[];
  vehicles: Vehicle[];
  applications: Application[];
  crossings: Crossing[];
  notifications: Notification[];
}

const initialData: DBStore = {
  users: [
    {
      id: 'officer-1',
      role: UserRole.OFFICER,
      name: 'Officer Wong',
      email: 'officer1@lta.gov.sg',
      password: 'pswd1',
      phone: '+65 9123 4567',
      maskedId: 'SXXXX123A',
      createdAt: new Date().toISOString()
    },
    {
      id: 'officer-2',
      role: UserRole.OFFICER,
      name: 'Officer Lim',
      email: 'officer2@lta.gov.sg',
      password: 'pswd2',
      phone: '+65 9876 5432',
      maskedId: 'SXXXX456B',
      createdAt: new Date().toISOString()
    },
    {
      id: 'officer-3',
      role: UserRole.OFFICER,
      name: 'Officer Singh',
      email: 'officer3@lta.gov.sg',
      password: 'pswd3',
      phone: '+65 8234 5678',
      maskedId: 'SXXXX789C',
      createdAt: new Date().toISOString()
    },
    {
      id: 'driver-1',
      role: UserRole.DRIVER,
      name: 'Ahmad Ismail',
      email: 'mdriver1@gmail.com',
      password: 'password 1',
      phone: '+60 123 456 789',
      maskedId: 'XXXXXX-XX-5432',
      createdAt: new Date().toISOString()
    },
    {
      id: 'driver-2',
      role: UserRole.DRIVER,
      name: 'Siti Aminah',
      email: 'mdriver2@gmail.com',
      password: 'password 2',
      phone: '+60 198 765 432',
      maskedId: 'XXXXXX-XX-1122',
      createdAt: new Date().toISOString()
    },
    {
      id: 'driver-3',
      role: UserRole.DRIVER,
      name: 'Lee Chong Wei',
      email: 'mdriver3@gmail.com',
      password: 'password 3',
      phone: '+60 112 233 445',
      maskedId: 'XXXXXX-XX-9988',
      createdAt: new Date().toISOString()
    }
  ],
  vehicles: [
    {
      id: 'v-1',
      userId: 'driver-1',
      plateNo: 'JRS 2024',
      make: 'Proton',
      model: 'X50',
      year: 2023,
      vin: 'PROX50-00123456',
      insuranceExpiry: '2025-06-15',
      createdAt: new Date().toISOString()
    },
    {
      id: 'v-2',
      userId: 'driver-2',
      plateNo: 'WVV 8888',
      make: 'Perodua',
      model: 'Myvi',
      year: 2021,
      vin: 'PERMY-99887766',
      insuranceExpiry: '2024-05-10',
      createdAt: new Date().toISOString()
    }
  ],
  applications: [
    {
      id: 'app-1',
      userId: 'driver-1',
      vehicleId: 'v-1',
      status: ApplicationStatus.APPROVED,
      submittedAt: '2024-01-01T10:00:00Z',
      reviewedAt: '2024-01-02T14:30:00Z',
      expiryDate: '2025-01-01T23:59:59Z',
      createdAt: '2024-01-01T09:00:00Z',
      paymentStatus: 'PAID',
      documents: []
    },
    {
      id: 'app-2',
      userId: 'driver-2',
      vehicleId: 'v-2',
      status: ApplicationStatus.PENDING_REVIEW,
      submittedAt: '2024-02-15T08:00:00Z',
      createdAt: '2024-02-15T07:30:00Z',
      paymentStatus: 'PAID',
      documents: []
    }
  ],
  crossings: [],
  notifications: [
    {
      id: 'n-1',
      userId: 'driver-1',
      type: 'PERMIT_APPROVED',
      title: 'Application Approved',
      body: 'Your permit for JRS 2024 has been approved. You can now generate your QR code.',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]
};

export class DBService {
  private static getStore(): DBStore {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  }

  private static saveStore(store: DBStore) {
    localStorage.setItem(DB_KEY, JSON.stringify(store));
  }

  // Users
  static async getUser(email: string): Promise<User | undefined> {
    return this.getStore().users.find(u => u.email === email);
  }

  static async getUserById(id: string): Promise<User | undefined> {
    return this.getStore().users.find(u => u.id === id);
  }

  // Vehicles
  static async getVehicles(userId: string): Promise<Vehicle[]> {
    return this.getStore().vehicles.filter(v => v.userId === userId);
  }

  static async getVehicleById(id: string): Promise<Vehicle | undefined> {
    return this.getStore().vehicles.find(v => v.id === id);
  }

  static async addVehicle(vehicle: Vehicle): Promise<void> {
    const store = this.getStore();
    store.vehicles.push(vehicle);
    this.saveStore(store);
  }

  // Applications
  static async getApplications(userId?: string): Promise<Application[]> {
    const apps = this.getStore().applications;
    return userId ? apps.filter(a => a.userId === userId) : apps;
  }

  static async updateApplication(appId: string, updates: Partial<Application>): Promise<void> {
    const store = this.getStore();
    const index = store.applications.findIndex(a => a.id === appId);
    if (index !== -1) {
      store.applications[index] = { ...store.applications[index], ...updates };
      this.saveStore(store);
    }
  }

  static async createApplication(app: Application): Promise<void> {
    const store = this.getStore();
    store.applications.push(app);
    this.saveStore(store);
  }

  // Crossings
  static async logCrossing(crossing: Crossing): Promise<void> {
    const store = this.getStore();
    store.crossings.push(crossing);
    this.saveStore(store);
  }

  static async getCrossings(userId: string): Promise<Crossing[]> {
    return this.getStore().crossings.filter(c => c.userId === userId);
  }

  // Notifications
  static async getNotifications(userId: string): Promise<Notification[]> {
    return this.getStore().notifications.filter(n => n.userId === userId);
  }

  static async addNotification(notif: Notification): Promise<void> {
    const store = this.getStore();
    store.notifications.push(notif);
    this.saveStore(store);
  }
}

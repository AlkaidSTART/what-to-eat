/**
 * IndexedDB 数据库管理
 * 用于离线存储用户账户和转盘数据
 */

const DB_NAME = "what-to-eat-db";
const DB_VERSION = 1;

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface RouletteItem {
  id: string;
  name: string;
  fixedProbability: number | null;
}

export interface Roulette {
  id: string;
  name: string;
  type: string;
  isDefault: boolean;
  items: RouletteItem[];
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 用户表
        if (!db.objectStoreNames.contains("users")) {
          const userStore = db.createObjectStore("users", { keyPath: "id" });
          userStore.createIndex("username", "username", { unique: true });
        }

        // 转盘表
        if (!db.objectStoreNames.contains("roulettes")) {
          const rouletteStore = db.createObjectStore("roulettes", {
            keyPath: "id",
          });
          rouletteStore.createIndex("userId", "userId", { unique: false });
        }
      };
    });
  }

  // 用户相关操作
  async createUser(username: string, password: string): Promise<User> {
    if (!this.db) await this.init();

    const user: User = {
      id: crypto.randomUUID(),
      username,
      password,
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.add(user);

      request.onsuccess = () => resolve(user);
      request.onerror = () => {
        if (request.error?.name === "ConstraintError") {
          reject(new Error("用户名已存在"));
        } else {
          reject(request.error);
        }
      };
    });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("username");
      const request = index.get(username);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async validateUser(
    username: string,
    password: string
  ): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // 转盘相关操作
  async saveRoulette(roulette: Roulette): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["roulettes"], "readwrite");
      const store = transaction.objectStore("roulettes");
      const request = store.put({
        ...roulette,
        updatedAt: new Date(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRoulettesByUserId(userId: string | null): Promise<Roulette[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["roulettes"], "readonly");
      const store = transaction.objectStore("roulettes");
      const index = store.index("userId");
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRoulette(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["roulettes"], "readwrite");
      const store = transaction.objectStore("roulettes");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new IndexedDBManager();

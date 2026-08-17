import fs from "node:fs";
import path from "node:path";

export const AUTH_DIR = path.resolve(__dirname, ".auth");
export const STORAGE_STATE_PATH = path.join(AUTH_DIR, "state.json");
export const TEST_USER_PATH = path.join(AUTH_DIR, "test-user.json");

export interface TestUser {
  email: string;
  password: string;
  orgName: string;
  organizationId?: string;
  authUserId?: string;
}

export function readTestUser(): TestUser {
  return JSON.parse(fs.readFileSync(TEST_USER_PATH, "utf8"));
}

export function writeTestUser(user: TestUser) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(TEST_USER_PATH, JSON.stringify(user, null, 2));
}

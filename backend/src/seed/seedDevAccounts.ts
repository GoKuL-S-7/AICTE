import bcrypt from "bcrypt";
import { User, Role } from "../models/User";
import { Institution } from "../models/Institution";

const roleMap: Record<string, Role> = {
  fd_emp: "AICTE_FD_EMPLOYEE",
  pgrc_emp: "PGRC_EMPLOYEE",
  vig_emp: "VIGILANCE_EMPLOYEE",
};

function parseCredentials(envVar?: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!envVar) return map;
  for (const pair of envVar.split(",")) {
    const [userId, password] = pair.split(":");
    if (userId && password) {
      map[userId.trim()] = password.trim();
    }
  }
  return map;
}

/**
 * Development-only seed. Creates missing employee/institution accounts.
 * Existing records are preserved unless RESET_DEV_PASSWORDS=true.
 */
export async function seedDevAccounts() {
  const creds = parseCredentials(process.env.DEV_EMP_PASSWORDS);
  const reset = process.env.RESET_DEV_PASSWORDS === "true";

  for (const [userId, plainPwd] of Object.entries(creds)) {
    const role = roleMap[userId];
    if (!role) {
      console.warn(`No role defined for development userId ${userId}, skipping.`);
      continue;
    }
    const existing = await User.findOne({ userId }).exec();
    if (!existing) {
      const passwordHash = await bcrypt.hash(plainPwd, 10);
      await User.create({
        userId,
        passwordHash,
        role,
        accountStatus: "ACTIVE",
      });
      console.log(`Created development employee ${userId} (${role})`);
    } else if (reset) {
      const passwordMatches = await bcrypt.compare(plainPwd, existing.passwordHash);
      if (!passwordMatches) {
        existing.passwordHash = await bcrypt.hash(plainPwd, 10);
        existing.role = role;
        existing.accountStatus = "ACTIVE";
        await existing.save();
        console.log(`Reset development password for ${userId}`);
      } else if (existing.role !== role || existing.accountStatus !== "ACTIVE") {
        existing.role = role;
        existing.accountStatus = "ACTIVE";
        await existing.save();
      }
    }
  }

  const instUser = (process.env.DEV_INSTITUTION_USER || "").trim();
  const instPass = process.env.DEV_INSTITUTION_PASSWORD || "";
  if (instUser && instPass) {
    let user = await User.findOne({ userId: instUser }).exec();
    if (!user) {
      const passwordHash = await bcrypt.hash(instPass, 10);
      user = await User.create({
        userId: instUser,
        username: instUser,
        collegeId: "CLG-DEV-000001",
        passwordHash,
        role: "INSTITUTION",
        accountStatus: "ACTIVE",
      });
      console.log(`Created development institution user ${instUser}`);
    } else if (reset) {
      const passwordMatches = await bcrypt.compare(instPass, user.passwordHash);
      if (!passwordMatches) {
        user.passwordHash = await bcrypt.hash(instPass, 10);
        user.role = "INSTITUTION";
        user.accountStatus = "ACTIVE";
        if (!user.collegeId) user.collegeId = "CLG-DEV-000001";
        await user.save();
        console.log(`Reset development institution password for ${instUser}`);
      } else if (user.role !== "INSTITUTION" || user.accountStatus !== "ACTIVE" || !user.collegeId) {
        user.role = "INSTITUTION";
        user.accountStatus = "ACTIVE";
        if (!user.collegeId) user.collegeId = "CLG-DEV-000001";
        await user.save();
      }
    }

    let inst = await Institution.findOne({ collegeId: user.collegeId || "CLG-DEV-000001" }).exec();
    if (!inst) {
      inst = await Institution.create({
        collegeId: user.collegeId || "CLG-DEV-000001",
        name: "[DEV] Sample Technical Institution",
        email: "dev-institution@example.local",
        institutionType: "Engineering",
        state: "Delhi",
        district: "New Delhi",
        address: "Development seed record — not a real institution",
        principalName: "Dev Principal",
        authorizedContactPerson: "Dev Contact",
        registrationStatus: "APPROVED",
        profileCompleted: true,
        linkedUser: user._id,
      });
      console.log("Created development institution profile CLG-DEV-000001");
    }
    if (!user.institutionId) {
      user.institutionId = inst._id.toString();
      await user.save();
    }
  }
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profilePhoto?: string;
  momoNumber: string;
  kycStatus: "pending" | "not_submitted" | "submitted" | "approved" | "rejected";
  joinedDate: string;
  totalSaved: number;
  activeGroups: number;
  role: "member" | "admin" | "super_admin" | "manager" | "support";
  status: "active" | "pending_verification" | "suspended" | "banned";
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  notificationPreferences?: Record<string, boolean>;
  referralCode?: string;
}

export interface SusuGroup {
  id: string;
  name: string;
  description?: string;
  type: "public" | "request" | "paid";
  group_size: number;
  daily_amount: number;
  days_per_turn: number;
  payout_amount: number;
  join_fee: number;
  status: "draft" | "open" | "active" | "paused" | "completed" | "cancelled";
  category?: string;
  start_date?: string;
  rules_text?: string;
  grace_period_hours: number;
  late_fee: number;
  member_count?: number;
  spots_left?: number;
  is_full?: boolean;
  can_join?: boolean;
  user_membership?: GroupMembership;
  user_turn_position?: number;
  pending_requests?: number;
  created_at: string;
  created_by?: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id: string;
  status: "pending" | "approved" | "active" | "completed" | "removed" | "banned" | "rejected";
  turn_position?: number;
  joined_at?: string;
  has_received_payout?: boolean;
  total_contributed?: number;
  join_fee_paid?: boolean;
  user?: {
    id: string;
    full_name: string;
    phone: string;
    profile_photo_url?: string;
  };
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_contributed: number;
  total_received: number;
  currency: string;
  status: string;
  last_transaction_at?: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: "deposit" | "withdrawal" | "contribution" | "payout" | "fee" | "refund";
  amount: number;
  balance_before: number;
  balance_after: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  reference?: string;
  created_at: string;
  completed_at?: string;
}

export interface PaymentIntent {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: "momo" | "card" | "cash";
  provider: string;
  purpose: "contribution" | "join_fee" | "wallet_topup";
  status: "pending" | "completed" | "failed" | "expired";
  group_id?: string;
  checkout_url?: string;
  instructions?: string;
  provider_reference?: string;
  created_at: string;
  expires_at: string;
}

export interface Contribution {
  id: string;
  schedule_id: string;
  group_id: string;
  user_id: string;
  amount: number;
  late_fee: number;
  total_amount: number;
  payment_method: string;
  paid_at: string;
  is_late: boolean;
  days_late: number;
  groups?: { id: string; name: string; daily_amount: number };
}

export interface ContributionSchedule {
  id: string;
  group_id: string;
  user_id: string;
  due_date: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "missed";
  late_fee?: number;
  total_amount?: number;
  group_name?: string;
  groups?: { id: string; name: string; daily_amount: number; status: string };
}

export interface Payout {
  id: string;
  group_id: string;
  user_id: string;
  amount: number;
  status: "scheduled" | "initiated" | "approved" | "paid" | "failed" | "cancelled";
  turn_position: number;
  paid_at?: string;
  created_at: string;
  groups?: { id: string; name: string; payout_amount: number };
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  wallet_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  withdrawal_method: "momo" | "bank";
  momo_number?: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
  status: "pending" | "approved" | "processing" | "completed" | "rejected" | "failed";
  requested_at: string;
  processed_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "payment" | "payout" | "group" | "system";
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface AdminStats {
  total_users: number;
  active_groups: number;
  total_groups: number;
  active_memberships: number;
  pending_requests: number;
  pending_withdrawals: number;
  today_contributions: number;
  total_contributed: number;
  total_paid_out: number;
  profit: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

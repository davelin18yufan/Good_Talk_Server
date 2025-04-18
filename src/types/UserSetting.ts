import { Prisma } from "@prisma/client"

// user create DTO
export interface CreateUserSettingsDto {
  userId: string 
  initialCapital: Prisma.Decimal | number // 接受 number（Prisma 會轉為 Decimal）
  leverageRatio: Prisma.Decimal | number
  currentCapital?: Prisma.Decimal | number
  commissionRate?: Prisma.Decimal | number
  dashboardLayout?: {
    dashboardLayout: ResponsiveLayouts
    toolbox: ResponsiveLayouts
  } 
  riskTolerance: Prisma.Decimal | number
  avatarUrl?: string
  profileVideoId?: string
  bio?: string
  location?: string
  aka?: string
}

export type UpdateUserSettingsDto = Partial<CreateUserSettingsDto>

export interface UpdateDashboardLayoutDto {
  dashboardLayout: ResponsiveLayouts
  toolbox: ResponsiveLayouts
}

export interface GridItem {
  w: number // 寬度
  h: number // 高度
  x: number // x 座標
  y: number // y 座標
  i: string // ID
  minW: number // 最小寬度
  minH: number // 最小高度
  moved: boolean // 是否被移動
  static: boolean // 是否靜態（不可拖動）
  chartId: string // 圖表 ID
}

export type Breakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';

export type ResponsiveLayouts = Map<Breakpoint, GridItem[]>;

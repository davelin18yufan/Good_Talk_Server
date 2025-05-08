import { prisma } from "@/database"
import {
  CHART_HANDLERS,
  DEFAULT_LAYOUTS,
  DEFAULT_TOOLBOX,
} from "@/constants/charts"
import { ResponsiveLayouts, GridItem } from "@/types"
import { ChartData } from "@/types/Transaction"

export async function recalculatePerformance(
  userId: string
): Promise<ChartData> {
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  let chartIds: string[] = []
  let dashboardLayout: ResponsiveLayouts = DEFAULT_LAYOUTS
  let toolbox: ResponsiveLayouts = DEFAULT_TOOLBOX

  if (userSettings?.dashboardLayout) {
    try {
      const layoutData = userSettings.dashboardLayout as any
      dashboardLayout = layoutData.dashboardLayout || DEFAULT_LAYOUTS
      toolbox = layoutData.toolbox || DEFAULT_TOOLBOX
    } catch (error) {
      console.error("Error parsing dashboardLayout:", error)
    }
  }

  chartIds = [
    ...Object.values(dashboardLayout)
      .flat()
      .map((item: GridItem) => item.chartId),
    ...Object.values(toolbox)
      .flat()
      .map((item: GridItem) => item.chartId),
  ].filter((chartId, index, self) => self.indexOf(chartId) === index)

  if (chartIds.length === 0) {
    chartIds = [
      ...Object.values(DEFAULT_LAYOUTS)
        .flat()
        .map((item: GridItem) => item.chartId),
      ...Object.values(DEFAULT_TOOLBOX)
        .flat()
        .map((item: GridItem) => item.chartId),
    ].filter((chartId, index, self) => self.indexOf(chartId) === index)
  }

  const result: ChartData = {}
  for (const chartId of chartIds) {
    const handler = CHART_HANDLERS[chartId as keyof typeof CHART_HANDLERS]
    if (handler) {
      try {
        result[chartId] = await handler(userId, prisma)
      } catch (error) {
        console.error(`Error computing ${chartId}:`, error)
        result[chartId] = []
      }
    }
  }

  return result
}
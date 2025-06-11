import { ModuleStatus, ModulePageStatus } from '../types'

export const mapModulePageStatusToModuleStatus = (
  pageStatus: ModulePageStatus
): ModuleStatus => {
  switch (pageStatus) {
    case ModulePageStatus.PUBLISHED:
      return ModuleStatus.ACTIVE
    case ModulePageStatus.DRAFT:
      return ModuleStatus.DRAFT
    case ModulePageStatus.ARCHIVED:
      return ModuleStatus.ARCHIVED
    default:
      return ModuleStatus.DRAFT
  }
}

export const mapModuleStatusToModulePageStatus = (
  moduleStatus: ModuleStatus
): ModulePageStatus => {
  switch (moduleStatus) {
    case ModuleStatus.ACTIVE:
      return ModulePageStatus.PUBLISHED
    case ModuleStatus.DRAFT:
      return ModulePageStatus.DRAFT
    case ModuleStatus.ARCHIVED:
      return ModulePageStatus.ARCHIVED
    default:
      return ModulePageStatus.DRAFT
  }
}

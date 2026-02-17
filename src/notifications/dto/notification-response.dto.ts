import { NotificationType, NotificationPriority } from '../../common/enums';
import { NotificationAction } from '../../common/types';

export class NotificationResponseDto {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  timestamp: string;
  action?: NotificationAction;
  meta?: Record<string, any>;
}

export class PaginatedNotificationsDto {
  data: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

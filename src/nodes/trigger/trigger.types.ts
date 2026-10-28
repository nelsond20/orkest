export type TriggerEventType = 'order.created' | 'appointment.created' | 'manual'

export interface TriggerConfig {
  eventType: TriggerEventType
}

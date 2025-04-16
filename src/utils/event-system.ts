import { EventSystem, GameEvent, GameEventType } from '../types/events';

/**
 * Implementation of the event system for game-wide communication
 */
export class EventManager implements EventSystem {
  // Map of event types to arrays of callback functions
  private listeners: Map<GameEventType, Array<(event: GameEvent) => void>> = new Map();
  
  /**
   * Subscribe to an event
   * @param eventType Type of event to subscribe to
   * @param callback Function to call when the event occurs
   * @returns Unsubscribe function
   */
  subscribe<T extends GameEvent>(
    eventType: GameEventType,
    callback: (event: T) => void
  ): () => void {
    // Get or create the array of listeners for this event type
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    // Add the callback to the listeners
    const callbacks = this.listeners.get(eventType)!;
    callbacks.push(callback as (event: GameEvent) => void);
    
    // Return an unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback as (event: GameEvent) => void);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Publish an event
   * @param event The event to publish
   */
  publish<T extends GameEvent>(event: T): void {
    // Add timestamp if not present
    if (!event.timestamp) {
      (event as GameEvent).timestamp = Date.now();
    }
    
    // Get the listeners for this event type
    const callbacks = this.listeners.get(event.type);
    
    // If there are no listeners, return
    if (!callbacks || callbacks.length === 0) {
      return;
    }
    
    // Call all listeners with the event
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }
  
  /**
   * Unsubscribe all listeners for a specific event type
   * @param eventType Type of event to unsubscribe from
   */
  unsubscribeAll(eventType: GameEventType): void {
    this.listeners.delete(eventType);
  }
  
  /**
   * Clear all event listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Create a singleton instance of the event manager
export const eventManager = new EventManager();

/**
 * Helper function to create and publish an event
 * @param eventType Type of event to create
 * @param eventData Additional data for the event
 */
export function publishEvent<T extends GameEvent>(
  eventType: GameEventType,
  eventData: Omit<T, 'type' | 'timestamp'>
): void {
  const event = {
    type: eventType,
    timestamp: Date.now(),
    ...eventData
  } as T;
  
  eventManager.publish(event);
}

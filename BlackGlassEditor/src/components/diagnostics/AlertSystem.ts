/**
 * 🔔 AlertSystem - Real-time notifications for developers when things break
 * This ensures developers know immediately when issues occur
 */

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  action: string;
  element: string;
  context: {
    viewport: { width: number; height: number };
    userAgent: string;
    url: string;
  };
  resolved: boolean;
  resolvedAt?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (outcome: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  enabled: boolean;
}

export class AlertSystem {
  private static instance: AlertSystem;
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private listeners: ((alert: Alert) => void)[] = [];

  static getInstance(): AlertSystem {
    if (!AlertSystem.instance) {
      AlertSystem.instance = new AlertSystem();
    }
    return AlertSystem.instance;
  }

  constructor() {
    this.initializeDefaultRules();
  }

  // Initialize default alert rules
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'element-flew-off-screen',
        name: 'Element Flew Off Screen',
        condition: (outcome) => !outcome.actualResult.elementInBounds,
        severity: 'high',
        message: 'Element flew off screen during drag operation',
        enabled: true
      },
      {
        id: 'element-became-invisible',
        name: 'Element Became Invisible',
        condition: (outcome) => !outcome.actualResult.elementVisible,
        severity: 'critical',
        message: 'Element became invisible after interaction',
        enabled: true
      },
      {
        id: 'element-did-not-move',
        name: 'Element Did Not Move',
        condition: (outcome) => outcome.actionType === 'drag' && outcome.deviation < 1,
        severity: 'medium',
        message: 'Element did not move despite drag action',
        enabled: true
      },
      {
        id: 'high-deviation',
        name: 'High Position Deviation',
        condition: (outcome) => outcome.deviation > 50,
        severity: 'high',
        message: 'Element moved far from expected position',
        enabled: true
      },
      {
        id: 'wrong-direction',
        name: 'Wrong Movement Direction',
        condition: (outcome) => outcome.actionType === 'drag' && outcome.errorMessage?.includes('wrong direction'),
        severity: 'medium',
        message: 'Element moved in wrong direction',
        enabled: true
      }
    ];
  }

  // Check if an outcome should trigger an alert
  checkOutcome(outcome: any): void {
    for (const rule of this.rules) {
      if (rule.enabled && rule.condition(outcome)) {
        this.createAlert(rule, outcome);
      }
    }
  }

  // Create an alert
  private createAlert(rule: AlertRule, outcome: any): void {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: this.getAlertType(rule.severity),
      severity: rule.severity,
      title: rule.name,
      message: rule.message,
      timestamp: Date.now(),
      action: outcome.actionType,
      element: outcome.actualResult.elementId || 'unknown',
      context: {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      resolved: false
    };

    this.alerts.unshift(alert); // Add to beginning for newest first
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(alert));

    // Log to console for immediate visibility
    this.logAlert(alert);
  }

  private getAlertType(severity: string): 'error' | 'warning' | 'info' | 'success' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }

  private logAlert(alert: Alert): void {
    const emoji = this.getSeverityEmoji(alert.severity);
    const style = this.getConsoleStyle(alert.severity);
    
    console.group(`${emoji} ${alert.title}`);
    console.log(`%c${alert.message}`, style);
    console.log('Element:', alert.element);
    console.log('Action:', alert.action);
    console.log('Context:', alert.context);
    console.groupEnd();
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }

  private getConsoleStyle(severity: string): string {
    switch (severity) {
      case 'critical': return 'color: #ff0000; font-weight: bold; font-size: 14px;';
      case 'high': return 'color: #ff6600; font-weight: bold;';
      case 'medium': return 'color: #ffaa00; font-weight: bold;';
      case 'low': return 'color: #0066cc;';
      default: return 'color: #666;';
    }
  }

  // Add custom alert rule
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  // Remove alert rule
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  // Enable/disable rule
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  // Get all alerts
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Get unresolved alerts
  getUnresolvedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: string): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
    }
  }

  // Clear resolved alerts
  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(alert => !alert.resolved);
  }

  // Subscribe to new alerts
  onAlert(callback: (alert: Alert) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Get alert statistics
  getStatistics(): any {
    const total = this.alerts.length;
    const unresolved = this.alerts.filter(a => !a.resolved).length;
    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unresolved,
      resolved: total - unresolved,
      bySeverity,
      rules: this.rules.length,
      activeRules: this.rules.filter(r => r.enabled).length
    };
  }

  // Export alerts for analysis
  exportAlerts(): any {
    return {
      alerts: this.alerts,
      rules: this.rules,
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Global instance
export const alertSystem = AlertSystem.getInstance();

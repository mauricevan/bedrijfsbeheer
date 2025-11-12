import { AnalyticsEvent, ModuleKey, OptimizationRecommendation, ModuleUsageStats, UserActivityStats, ProcessMetrics, AnalyticsDashboard } from '../types';

// LocalStorage key for analytics data
const ANALYTICS_STORAGE_KEY = 'bedrijfsbeheer_analytics';

// Get all analytics events from storage
export const getAnalyticsEvents = (): AnalyticsEvent[] => {
    try {
        const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        if (!stored) return [];
        const data = JSON.parse(stored);
        return data.events || [];
    } catch (error) {
        console.error('Error loading analytics:', error);
        return [];
    }
};

// Save analytics event
export const saveAnalyticsEvent = (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void => {
    try {
        const events = getAnalyticsEvents();
        const newEvent: AnalyticsEvent = {
            ...event,
            id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
        };
        
        events.push(newEvent);
        
        // Keep only last 10,000 events to prevent storage overflow
        const trimmedEvents = events.slice(-10000);
        
        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify({
            events: trimmedEvents,
            lastUpdated: new Date().toISOString(),
        }));
    } catch (error) {
        console.error('Error saving analytics:', error);
    }
};

// Track user action
export const trackAction = (
    userId: string,
    userRole: string,
    module: ModuleKey,
    action: string,
    actionType: AnalyticsEvent['actionType'],
    metadata?: AnalyticsEvent['metadata']
): void => {
    saveAnalyticsEvent({
        userId,
        userRole,
        module,
        action,
        actionType,
        metadata,
    });
};

// Track navigation
export const trackNavigation = (
    userId: string,
    userRole: string,
    fromModule: ModuleKey | null,
    toModule: ModuleKey,
    duration?: number
): void => {
    saveAnalyticsEvent({
        userId,
        userRole,
        module: toModule,
        action: `navigate_to_${toModule}`,
        actionType: 'navigate',
        duration,
        metadata: {
            fromModule,
        },
    });
};

// Track task completion
export const trackTaskCompletion = (
    userId: string,
    userRole: string,
    module: ModuleKey,
    taskType: string,
    duration: number,
    success: boolean,
    errors?: string[]
): void => {
    saveAnalyticsEvent({
        userId,
        userRole,
        module,
        action: `complete_${taskType}`,
        actionType: success ? 'complete' : 'error',
        duration,
        metadata: {
            taskType,
            outcome: success ? 'success' : 'failure',
            errors,
        },
    });
};

// Calculate module usage statistics
export const calculateModuleStats = (
    events: AnalyticsEvent[],
    startDate?: Date,
    endDate?: Date
): ModuleUsageStats[] => {
    const filtered = events.filter(e => {
        if (!startDate && !endDate) return true;
        const eventDate = new Date(e.timestamp);
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        return true;
    });

    const moduleMap = new Map<ModuleKey, {
        sessions: Set<string>;
        time: number;
        actions: number;
        errors: number;
        lastUsed: Date;
        events: AnalyticsEvent[];
    }>();

    filtered.forEach(event => {
        const existing = moduleMap.get(event.module) || {
            sessions: new Set(),
            time: 0,
            actions: 0,
            errors: 0,
            lastUsed: new Date(0),
            events: [],
        };

        // Track sessions (group by userId and date)
        const sessionKey = `${event.userId}_${event.timestamp.split('T')[0]}`;
        existing.sessions.add(sessionKey);

        // Accumulate time
        if (event.duration) {
            existing.time += event.duration / 60000; // Convert to minutes
        }

        // Count actions
        existing.actions++;

        // Count errors
        if (event.actionType === 'error') {
            existing.errors++;
        }

        // Track last used
        const eventDate = new Date(event.timestamp);
        if (eventDate > existing.lastUsed) {
            existing.lastUsed = eventDate;
        }

        existing.events.push(event);
        moduleMap.set(event.module, existing);
    });

    // Calculate trends (compare to previous period)
    const stats: ModuleUsageStats[] = [];
    moduleMap.forEach((data, module) => {
        const avgDuration = data.sessions.size > 0 ? data.time / data.sessions.size : 0;
        
        // Calculate trend (simplified: compare last week to previous week)
        const now = new Date();
        const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const lastWeekActions = data.events.filter(e => {
            const d = new Date(e.timestamp);
            return d >= lastWeekStart && d < lastWeekEnd;
        }).length;
        
        const thisWeekActions = data.events.filter(e => {
            const d = new Date(e.timestamp);
            return d >= thisWeekStart;
        }).length;

        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (lastWeekActions > 0) {
            const change = ((thisWeekActions - lastWeekActions) / lastWeekActions) * 100;
            if (change > 10) trend = 'increasing';
            else if (change < -10) trend = 'decreasing';
        }

        stats.push({
            module,
            totalSessions: data.sessions.size,
            totalTime: Math.round(data.time),
            averageSessionDuration: Math.round(avgDuration),
            uniqueUsers: new Set(data.events.map(e => e.userId)).size,
            actionsCount: data.actions,
            errorCount: data.errors,
            lastUsed: data.lastUsed.toISOString(),
            usageTrend: trend,
        });
    });

    return stats.sort((a, b) => b.actionsCount - a.actionsCount);
};

// Calculate user activity statistics
export const calculateUserStats = (
    events: AnalyticsEvent[],
    startDate?: Date,
    endDate?: Date
): UserActivityStats[] => {
    const filtered = events.filter(e => {
        if (!startDate && !endDate) return true;
        const eventDate = new Date(e.timestamp);
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        return true;
    });

    const userMap = new Map<string, {
        name: string;
        role: string;
        sessions: Set<string>;
        time: number;
        modules: Set<ModuleKey>;
        actions: number;
        completedTasks: number;
        errors: number;
        lastActive: Date;
        events: AnalyticsEvent[];
    }>();

    filtered.forEach(event => {
        const existing = userMap.get(event.userId) || {
            name: event.userId,
            role: event.userRole,
            sessions: new Set(),
            time: 0,
            modules: new Set(),
            actions: 0,
            completedTasks: 0,
            errors: 0,
            lastActive: new Date(0),
            events: [],
        };

        const sessionKey = `${event.userId}_${event.timestamp.split('T')[0]}`;
        existing.sessions.add(sessionKey);

        if (event.duration) {
            existing.time += event.duration / 60000;
        }

        existing.modules.add(event.module);
        existing.actions++;
        
        if (event.actionType === 'complete') {
            existing.completedTasks++;
        }
        
        if (event.actionType === 'error') {
            existing.errors++;
        }

        const eventDate = new Date(event.timestamp);
        if (eventDate > existing.lastActive) {
            existing.lastActive = eventDate;
        }

        existing.events.push(event);
        userMap.set(event.userId, existing);
    });

    const stats: UserActivityStats[] = [];
    userMap.forEach((data, userId) => {
        const avgDuration = data.sessions.size > 0 ? data.time / data.sessions.size : 0;
        
        // Calculate efficiency score (0-100)
        // Based on: completion rate, error rate, time efficiency
        const completionRate = data.actions > 0 ? (data.completedTasks / data.actions) * 100 : 0;
        const errorRate = data.actions > 0 ? (data.errors / data.actions) * 100 : 0;
        const efficiencyScore = Math.max(0, Math.min(100, 
            (completionRate * 0.6) + ((100 - errorRate) * 0.4)
        ));

        // Find most used module
        const moduleCounts = new Map<ModuleKey, number>();
        data.events.forEach(e => {
            moduleCounts.set(e.module, (moduleCounts.get(e.module) || 0) + 1);
        });
        const mostUsed = Array.from(moduleCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || ModuleKey.DASHBOARD;

        stats.push({
            userId,
            userName: data.name,
            role: data.role,
            totalSessions: data.sessions.size,
            totalTime: Math.round(data.time),
            modulesUsed: Array.from(data.modules),
            mostUsedModule: mostUsed,
            averageSessionDuration: Math.round(avgDuration),
            lastActive: data.lastActive.toISOString(),
            efficiencyScore: Math.round(efficiencyScore),
        });
    });

    return stats.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
};

// Calculate process metrics
export const calculateProcessMetrics = (
    events: AnalyticsEvent[],
    processFlows: Array<{ name: string; steps: string[] }>
): ProcessMetrics[] => {
    const metrics: ProcessMetrics[] = [];

    processFlows.forEach(flow => {
        const processEvents = events.filter(e => 
            flow.steps.some(step => e.action.includes(step))
        );

        if (processEvents.length === 0) return;

        // Group by task (same userId, same day, similar actions)
        const taskGroups = new Map<string, AnalyticsEvent[]>();
        
        // Try to find sequences of events that represent a task
        const sortedEvents = processEvents.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        sortedEvents.forEach(event => {
            // Look for matching task (within 2 hours of previous step)
            let foundGroup = false;
            for (const [key, group] of taskGroups.entries()) {
                const lastEvent = group[group.length - 1];
                const lastTime = new Date(lastEvent.timestamp).getTime();
                const currentTime = new Date(event.timestamp).getTime();
                const timeDiff = (currentTime - lastTime) / (1000 * 60 * 60); // hours
                
                // If same user, same day, and within reasonable time window
                if (lastEvent.userId === event.userId && 
                    lastEvent.timestamp.split('T')[0] === event.timestamp.split('T')[0] &&
                    timeDiff < 4) { // 4 hour window for task completion
                    group.push(event);
                    foundGroup = true;
                    break;
                }
            }
            
            if (!foundGroup) {
                const taskKey = `${event.userId}_${event.timestamp.split('T')[0]}_${flow.name}_${Date.now()}`;
                taskGroups.set(taskKey, [event]);
            }
        });

        // Calculate metrics per task group
        let totalCycleTime = 0;
        let totalSteps = 0;
        let completedCount = 0;
        let errorCount = 0;
        const stepWaitTimes = new Map<string, { total: number; count: number }>();

        taskGroups.forEach(group => {
            if (group.length === 0) return;

            const sorted = group.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            const startTime = new Date(sorted[0].timestamp);
            const endEvent = sorted.find(e => e.actionType === 'complete') || sorted[sorted.length - 1];
            const endTime = new Date(endEvent.timestamp);
            
            const cycleTime = (endTime.getTime() - startTime.getTime()) / 60000; // minutes
            totalCycleTime += cycleTime;
            totalSteps += sorted.length;
            
            if (endEvent.actionType === 'complete') {
                completedCount++;
            }
            
            if (sorted.some(e => e.actionType === 'error')) {
                errorCount++;
            }

            // Calculate wait times between steps
            for (let i = 1; i < sorted.length; i++) {
                const prevTime = new Date(sorted[i - 1].timestamp);
                const currTime = new Date(sorted[i].timestamp);
                const waitTime = (currTime.getTime() - prevTime.getTime()) / 60000;
                
                const stepName = sorted[i].action;
                const existing = stepWaitTimes.get(stepName) || { total: 0, count: 0 };
                existing.total += waitTime;
                existing.count++;
                stepWaitTimes.set(stepName, existing);
            }
        });

        const taskCount = taskGroups.size;
        const avgCycleTime = taskCount > 0 ? totalCycleTime / taskCount : 0;
        const avgSteps = taskCount > 0 ? totalSteps / taskCount : 0;
        const completionRate = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
        const errorRate = taskCount > 0 ? (errorCount / taskCount) * 100 : 0;
        
        // Calculate rework rate (simplified: tasks with multiple attempts at same step)
        let reworkCount = 0;
        taskGroups.forEach(group => {
            const stepCounts = new Map<string, number>();
            group.forEach(e => {
                stepCounts.set(e.action, (stepCounts.get(e.action) || 0) + 1);
            });
            if (Array.from(stepCounts.values()).some(count => count > 1)) {
                reworkCount++;
            }
        });
        const reworkRate = taskCount > 0 ? (reworkCount / taskCount) * 100 : 0;

        // Identify bottlenecks
        const bottlenecks = Array.from(stepWaitTimes.entries())
            .map(([step, data]) => ({
                step,
                averageWaitTime: data.count > 0 ? data.total / data.count : 0,
                frequency: data.count,
            }))
            .filter(b => b.averageWaitTime > 5) // Only steps with >5 min average wait
            .sort((a, b) => b.averageWaitTime - a.averageWaitTime)
            .slice(0, 5); // Top 5

        metrics.push({
            processName: flow.name,
            averageCycleTime: Math.round(avgCycleTime),
            averageSteps: Math.round(avgSteps),
            completionRate: Math.round(completionRate * 100) / 100,
            errorRate: Math.round(errorRate * 100) / 100,
            reworkRate: Math.round(reworkRate * 100) / 100,
            bottleneckSteps: bottlenecks,
        });
    });

    return metrics;
};

// Generate optimization recommendations
export const generateRecommendations = (
    moduleStats: ModuleUsageStats[],
    userStats: UserActivityStats[],
    processMetrics: ProcessMetrics[],
    events: AnalyticsEvent[]
): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = [];

    // 1. Low-usage modules
    const lowUsageModules = moduleStats.filter(s => 
        s.totalSessions < 5 && s.usageTrend === 'decreasing'
    );
    lowUsageModules.forEach(stat => {
        recommendations.push({
            id: `rec_low_usage_${stat.module}`,
            priority: 'medium',
            category: 'feature',
            title: `Module "${stat.module}" wordt weinig gebruikt`,
            description: `Deze module heeft slechts ${stat.totalSessions} sessies. Overweeg betere onboarding of visibility verbetering.`,
            impact: 'Verhoog module adoption met 30%',
            effort: 'low',
            roi: 60,
            metrics: {
                current: stat.totalSessions,
                target: stat.totalSessions * 1.3,
                unit: 'sessies',
            },
            actions: [
                'Voeg module toe aan quick access menu',
                'Maak onboarding tutorial voor deze module',
                'Verzend awareness notificatie aan gebruikers',
            ],
        });
    });

    // 2. High error rates
    const highErrorModules = moduleStats.filter(s => 
        s.errorCount > 0 && (s.errorCount / s.actionsCount) > 0.1
    );
    highErrorModules.forEach(stat => {
        const errorRate = Math.round((stat.errorCount / stat.actionsCount) * 100);
        recommendations.push({
            id: `rec_errors_${stat.module}`,
            priority: 'high',
            category: 'quality',
            title: `Hoge foutmeldingen in module "${stat.module}"`,
            description: `${errorRate}% van de acties resulteren in fouten. Dit wijst op usability of procesproblemen.`,
            impact: `Verlaag foutpercentage van ${errorRate}% naar <5%`,
            effort: 'medium',
            roi: 85,
            metrics: {
                current: errorRate,
                target: 5,
                unit: '%',
            },
            actions: [
                'Analyseer meest voorkomende fouten',
                'Voeg input validatie toe',
                'Verbeter error messages met duidelijke instructies',
                'Overweeg contextuele help',
            ],
        });
    });

    // 3. Process bottlenecks
    processMetrics.forEach(metric => {
        if (metric.bottleneckSteps.length > 0) {
            const topBottleneck = metric.bottleneckSteps[0];
            recommendations.push({
                id: `rec_bottleneck_${metric.processName}`,
                priority: 'high',
                category: 'process',
                title: `Bottleneck gedetecteerd in proces "${metric.processName}"`,
                description: `Stap "${topBottleneck.step}" heeft gemiddeld ${Math.round(topBottleneck.averageWaitTime)} minuten wachttijd.`,
                impact: `Verlaag proces tijd met ${Math.round(topBottleneck.averageWaitTime * 0.5)} minuten`,
                effort: 'medium',
                roi: 75,
                metrics: {
                    current: Math.round(topBottleneck.averageWaitTime),
                    target: Math.round(topBottleneck.averageWaitTime * 0.5),
                    unit: 'minuten',
                },
                actions: [
                    `Automatiseer stap "${topBottleneck.step}" waar mogelijk`,
                    'Voeg parallel processing toe',
                    'Verbeter resource allocation',
                    'Implementeer queue management',
                ],
            });
        }

        // High rework rate
        if (metric.reworkRate > 15) {
            recommendations.push({
                id: `rec_rework_${metric.processName}`,
                priority: 'medium',
                category: 'quality',
                title: `Hoge rework rate in proces "${metric.processName}"`,
                description: `${Math.round(metric.reworkRate)}% van de taken vereisen meerdere pogingen.`,
                impact: `Verlaag rework rate naar <5%`,
                effort: 'medium',
                roi: 70,
                metrics: {
                    current: Math.round(metric.reworkRate),
                    target: 5,
                    unit: '%',
                },
                actions: [
                    'Verbeter first-time-right rate',
                    'Voeg validatie toe aan kritieke stappen',
                    'Maak templates/standaarden',
                    'Train gebruikers op best practices',
                ],
            });
        }
    });

    // 4. Low efficiency users
    const lowEfficiencyUsers = userStats.filter(u => u.efficiencyScore < 60);
    if (lowEfficiencyUsers.length > 0) {
        recommendations.push({
            id: 'rec_low_efficiency_users',
            priority: 'medium',
            category: 'usability',
            title: `${lowEfficiencyUsers.length} gebruiker(s) met lage efficiency score`,
            description: `Sommige gebruikers hebben moeite met het systeem. Extra training of UI verbeteringen kunnen helpen.`,
            impact: `Verhoog efficiency score met 20 punten`,
            effort: 'low',
            roi: 65,
            metrics: {
                current: Math.round(lowEfficiencyUsers.reduce((sum, u) => sum + u.efficiencyScore, 0) / lowEfficiencyUsers.length),
                target: Math.round(lowEfficiencyUsers.reduce((sum, u) => sum + u.efficiencyScore, 0) / lowEfficiencyUsers.length) + 20,
                unit: 'score',
            },
            actions: [
                'Identificeer specifieke problemen per gebruiker',
                'Bied training sessies aan',
                'Verzamel feedback over moeilijke workflows',
                'Overweeg personalized UI/help',
            ],
        });
    }

    // 5. Automation opportunities (long cycle times)
    processMetrics.forEach(metric => {
        if (metric.averageCycleTime > 60 && metric.averageSteps > 5) {
            recommendations.push({
                id: `rec_automation_${metric.processName}`,
                priority: 'low',
                category: 'automation',
                title: `Automatisering mogelijkheid in "${metric.processName}"`,
                description: `Proces duurt gemiddeld ${Math.round(metric.averageCycleTime)} minuten met ${Math.round(metric.averageSteps)} stappen.`,
                impact: `Reduceer proces tijd met 50%`,
                effort: 'high',
                roi: 55,
                metrics: {
                    current: Math.round(metric.averageCycleTime),
                    target: Math.round(metric.averageCycleTime * 0.5),
                    unit: 'minuten',
                },
                actions: [
                    'Identificeer repetitieve stappen',
                    'Automatiseer data entry waar mogelijk',
                    'Implementeer workflow automation',
                    'Overweeg batch processing',
                ],
            });
        }
    });

    // Sort by priority and ROI
    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.roi - a.roi;
    });
};

// Build complete analytics dashboard
export const buildAnalyticsDashboard = (
    period: AnalyticsDashboard['period'] = 'month'
): AnalyticsDashboard => {
    const events = getAnalyticsEvents();
    
    if (events.length === 0) {
        return {
            period,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            totalEvents: 0,
            totalUsers: 0,
            totalTime: 0,
            moduleStats: [],
            userStats: [],
            processMetrics: [],
            recommendations: [],
            trends: {
                usageGrowth: 0,
                efficiencyChange: 0,
                errorRateChange: 0,
            },
        };
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
        case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const moduleStats = calculateModuleStats(events, startDate, endDate);
    const userStats = calculateUserStats(events, startDate, endDate);

    // Define key process flows - match actual event actions
    const processFlows = [
        {
            name: 'Offerte → Factuur',
            steps: ['create_quote', 'create_invoice', 'convert_to_invoice', 'validate_invoice', 'send_invoice', 'complete'],
        },
        {
            name: 'Offerte → Werkorder',
            steps: ['create_quote', 'convert_to_workorder', 'create_workorder', 'start_workorder', 'complete_workorder', 'complete'],
        },
        {
            name: 'Werkorder → Factuur',
            steps: ['create_workorder', 'complete_workorder', 'complete', 'auto_create_invoice', 'validate_invoice'],
        },
        {
            name: 'Werkorder Lifecycle',
            steps: ['create_workorder', 'start_workorder', 'update_status', 'complete_workorder', 'complete'],
        },
        {
            name: 'Factuur Validatie',
            steps: ['create_invoice', 'view', 'validate_invoice', 'send_invoice', 'complete'],
        },
    ];

    const processMetrics = calculateProcessMetrics(events, processFlows);
    const recommendations = generateRecommendations(moduleStats, userStats, processMetrics, events);

    // Calculate trends (simplified: compare current period to previous)
    const prevStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const prevModuleStats = calculateModuleStats(events, prevStartDate, startDate);
    
    const currentTotalActions = moduleStats.reduce((sum, s) => sum + s.actionsCount, 0);
    const prevTotalActions = prevModuleStats.reduce((sum, s) => sum + s.actionsCount, 0);
    const usageGrowth = prevTotalActions > 0 
        ? ((currentTotalActions - prevTotalActions) / prevTotalActions) * 100 
        : 0;

    const currentAvgEfficiency = userStats.length > 0
        ? userStats.reduce((sum, u) => sum + u.efficiencyScore, 0) / userStats.length
        : 0;
    const prevUserStats = calculateUserStats(events, prevStartDate, startDate);
    const prevAvgEfficiency = prevUserStats.length > 0
        ? prevUserStats.reduce((sum, u) => sum + u.efficiencyScore, 0) / prevUserStats.length
        : 0;
    const efficiencyChange = prevAvgEfficiency > 0
        ? ((currentAvgEfficiency - prevAvgEfficiency) / prevAvgEfficiency) * 100
        : 0;

    const currentErrorRate = moduleStats.reduce((sum, s) => sum + s.errorCount, 0) / 
        (moduleStats.reduce((sum, s) => sum + s.actionsCount, 0) || 1) * 100;
    const prevErrorRate = prevModuleStats.reduce((sum, s) => sum + s.errorCount, 0) / 
        (prevModuleStats.reduce((sum, s) => sum + s.actionsCount, 0) || 1) * 100;
    const errorRateChange = prevErrorRate > 0
        ? ((currentErrorRate - prevErrorRate) / prevErrorRate) * 100
        : 0;

    return {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalEvents: events.length,
        totalUsers: new Set(events.map(e => e.userId)).size,
        totalTime: Math.round(moduleStats.reduce((sum, s) => sum + s.totalTime, 0)),
        moduleStats,
        userStats,
        processMetrics,
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
        trends: {
            usageGrowth: Math.round(usageGrowth * 100) / 100,
            efficiencyChange: Math.round(efficiencyChange * 100) / 100,
            errorRateChange: Math.round(errorRateChange * 100) / 100,
        },
    };
};

// Clear analytics data (for testing/reset)
export const clearAnalytics = (): void => {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
};


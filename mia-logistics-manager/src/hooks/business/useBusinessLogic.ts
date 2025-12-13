import { useState, useCallback, useMemo } from 'react';
import { AdvancedPricingEngine } from '@/services/pricing/pricingEngine';
import { IntelligentVehicleSelector } from '@/services/vehicles/vehicleSelector';
import { SmartConsolidationEngine } from '@/services/consolidation/consolidationEngine';
import { PerformanceMonitor } from '@/utils/performance/monitor';
import { BUSINESS_CONFIG } from '@/config/businessConfig';
import type { Carrier } from '@/services/googleSheets/carriersService';
import type { Order } from '@/services/googleSheets/ordersService';
import type { PricingContext } from '@/services/pricing/pricingEngine';

export interface BusinessLogicState {
  isLoading: boolean;
  error: string | null;
  pricingEngine: AdvancedPricingEngine;
  vehicleSelector: IntelligentVehicleSelector;
  consolidationEngine: SmartConsolidationEngine;
  performanceMonitor: PerformanceMonitor;
}

export function useBusinessLogic() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessLogic = useMemo(
    () => ({
      pricingEngine: new AdvancedPricingEngine(),
      vehicleSelector: new IntelligentVehicleSelector(),
      consolidationEngine: new SmartConsolidationEngine(),
      performanceMonitor: PerformanceMonitor.getInstance(),
    }),
    []
  );

  const calculatePricing = useCallback(
    async (context: PricingContext, carriers: Carrier[]) => {
      setIsLoading(true);
      setError(null);

      try {
        businessLogic.performanceMonitor.startTimer('pricing-calculation');

        const pricingOptions =
          businessLogic.pricingEngine.compareCarrierPricing(context, carriers);

        businessLogic.performanceMonitor.endTimer('pricing-calculation');

        return pricingOptions;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Pricing calculation failed'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [businessLogic]
  );

  const getVehicleRecommendations = useCallback(
    async (packages: any[], context: PricingContext, options: any = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        businessLogic.performanceMonitor.startTimer('vehicle-selection');

        const recommendations = businessLogic.vehicleSelector.recommendVehicles(
          packages,
          context,
          options
        );

        businessLogic.performanceMonitor.endTimer('vehicle-selection');

        return recommendations;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Vehicle selection failed'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [businessLogic]
  );

  const analyzeConsolidation = useCallback(
    async (orders: Order[]) => {
      setIsLoading(true);
      setError(null);

      try {
        businessLogic.performanceMonitor.startTimer('consolidation-analysis');

        const opportunities =
          businessLogic.consolidationEngine.analyzeConsolidationOpportunities(
            orders
          );

        businessLogic.performanceMonitor.endTimer('consolidation-analysis');

        return opportunities;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Consolidation analysis failed'
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [businessLogic]
  );

  const getPerformanceReport = useCallback(() => {
    return businessLogic.performanceMonitor.generateReport();
  }, [businessLogic]);

  const clearPerformanceMetrics = useCallback(
    (operation?: string) => {
      businessLogic.performanceMonitor.clearMetrics(operation);
    },
    [businessLogic]
  );

  return {
    isLoading,
    error,
    calculatePricing,
    getVehicleRecommendations,
    analyzeConsolidation,
    getPerformanceReport,
    clearPerformanceMetrics,
    businessLogic,
  };
}

export function usePricingOptimization() {
  const { calculatePricing, isLoading, error } = useBusinessLogic();
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);

  const optimizePricing = useCallback(
    async (
      context: PricingContext,
      carriers: Carrier[],
      optimizationCriteria: 'cost' | 'speed' | 'quality' = 'cost'
    ) => {
      try {
        const pricingOptions = await calculatePricing(context, carriers);

        // Apply optimization criteria
        const optimizedOptions = [...pricingOptions];

        switch (optimizationCriteria) {
          case 'cost':
            optimizedOptions.sort(
              (a, b) => a.pricing.finalTotal - b.pricing.finalTotal
            );
            break;
          case 'speed':
            optimizedOptions.sort(
              (a, b) => b.carrier.rating - a.carrier.rating
            );
            break;
          case 'quality':
            optimizedOptions.sort((a, b) => b.score - a.score);
            break;
        }

        const result = {
          timestamp: new Date().toISOString(),
          criteria: optimizationCriteria,
          options: optimizedOptions,
          bestOption: optimizedOptions[0],
        };

        setOptimizationHistory((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10

        return result;
      } catch (err) {
        throw err;
      }
    },
    [calculatePricing]
  );

  return {
    optimizePricing,
    optimizationHistory,
    isLoading,
    error,
  };
}

export function useConsolidationOptimization() {
  const { analyzeConsolidation, isLoading, error } = useBusinessLogic();
  const [consolidationHistory, setConsolidationHistory] = useState<any[]>([]);

  const optimizeConsolidation = useCallback(
    async (orders: Order[], maxGroups: number = 5) => {
      try {
        const opportunities = await analyzeConsolidation(orders);

        // Filter and sort by savings
        const filteredOpportunities = opportunities
          .filter(
            (opp) =>
              opp.estimatedSavings >=
              BUSINESS_CONFIG.CONSOLIDATION.MIN_SAVINGS_THRESHOLD
          )
          .sort((a, b) => b.estimatedSavings - a.estimatedSavings)
          .slice(0, maxGroups);

        const result = {
          timestamp: new Date().toISOString(),
          totalOpportunities: opportunities.length,
          filteredOpportunities: filteredOpportunities.length,
          opportunities: filteredOpportunities,
          totalPotentialSavings: filteredOpportunities.reduce(
            (sum, opp) => sum + opp.estimatedSavings,
            0
          ),
        };

        setConsolidationHistory((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10

        return result;
      } catch (err) {
        throw err;
      }
    },
    [analyzeConsolidation]
  );

  return {
    optimizeConsolidation,
    consolidationHistory,
    isLoading,
    error,
  };
}

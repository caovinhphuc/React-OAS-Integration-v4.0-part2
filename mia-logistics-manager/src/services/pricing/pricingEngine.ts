// src/services/pricing/pricingEngine.ts
import Decimal from 'decimal.js';
import { Carrier } from '@/services/googleSheets/carriersService';

export interface PricingContext {
  distance: number; // kilometers
  volume: number; // cubic meters
  weight: number; // kilograms
  packageCount: number;
  serviceLevel: 'ECONOMY' | 'STANDARD' | 'EXPRESS' | 'PREMIUM';
  pickupLocation: string;
  deliveryLocation: string;
  scheduledDate: Date;
  isRemoteArea: boolean;
  requiresInsurance: boolean;
  fragileItems: boolean;
  oversizeItems: boolean;
  timeWindow?: {
    earliest: string;
    latest: string;
  };
}

export interface PricingBreakdown {
  baseCost: number;
  distanceCost: number;
  volumeCost: number;
  weightCost: number;
  serviceLevelSurcharge: number;
  fuelSurcharge: number;
  remoteAreaFee: number;
  insuranceFee: number;
  handlingFee: number;
  timeWindowFee: number;
  totalBeforeTax: number;
  taxAmount: number;
  finalTotal: number;
  currency: string;
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  condition: (context: PricingContext, carrier: Carrier) => boolean;
  calculator: (context: PricingContext, carrier: Carrier) => number;
  priority: number;
  isActive: boolean;
}

export class AdvancedPricingEngine {
  private rules: PricingRule[] = [];
  private readonly TAX_RATE = 0.1; // 10% VAT
  private readonly DIMENSIONAL_FACTOR = 167; // Standard air freight factor

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'base-rate',
        name: 'Base Rate',
        description: 'Minimum charge for any shipment',
        condition: () => true,
        calculator: (_context, carrier) => carrier.baseRate,
        priority: 1,
        isActive: true,
      },
      {
        id: 'distance-based',
        name: 'Distance-based Pricing',
        description: 'Cost per kilometer traveled',
        condition: (_context, carrier) => carrier.pricingMethod === 'PER_KM',
        calculator: (context, carrier) => {
          const decimal = new Decimal(context.distance).mul(carrier.perKmRate);
          return decimal.toNumber();
        },
        priority: 2,
        isActive: true,
      },
      {
        id: 'volume-based',
        name: 'Volume-based Pricing',
        description: 'Cost per cubic meter',
        condition: (_context, carrier) => carrier.pricingMethod === 'PER_M3',
        calculator: (context, carrier) => {
          const chargeableVolume = this.calculateChargeableVolume(context);
          return new Decimal(chargeableVolume)
            .mul(carrier.perM3Rate)
            .toNumber();
        },
        priority: 2,
        isActive: true,
      },
      {
        id: 'trip-based',
        name: 'Trip-based Pricing',
        description: 'Fixed cost per trip regardless of distance/weight',
        condition: (_context, carrier) => carrier.pricingMethod === 'PER_TRIP',
        calculator: (_context, carrier) => carrier.perTripRate,
        priority: 2,
        isActive: true,
      },
      {
        id: 'service-level-surcharge',
        name: 'Service Level Surcharge',
        description: 'Additional cost for premium service levels',
        condition: (context) => context.serviceLevel !== 'STANDARD',
        calculator: (context, carrier) => {
          const baseCost = carrier.baseRate;
          const surchargeRates = {
            ECONOMY: -0.15, // 15% discount
            STANDARD: 0,
            EXPRESS: 0.25, // 25% surcharge
            PREMIUM: 0.5, // 50% surcharge
          };
          return new Decimal(baseCost)
            .mul(surchargeRates[context.serviceLevel])
            .toNumber();
        },
        priority: 3,
        isActive: true,
      },
      {
        id: 'fuel-surcharge',
        name: 'Fuel Surcharge',
        description: 'Dynamic fuel cost adjustment',
        condition: () => true,
        calculator: (context, carrier) => {
          const baseCost = this.calculateBaseCost(context, carrier);
          return new Decimal(baseCost).mul(carrier.fuelSurcharge).toNumber();
        },
        priority: 4,
        isActive: true,
      },
      {
        id: 'remote-area-fee',
        name: 'Remote Area Fee',
        description: 'Additional fee for remote delivery locations',
        condition: (context) => context.isRemoteArea,
        calculator: (_context, carrier) => carrier.remoteAreaFee,
        priority: 5,
        isActive: true,
      },
      {
        id: 'insurance-fee',
        name: 'Insurance Fee',
        description: 'Optional insurance coverage',
        condition: (context) => context.requiresInsurance,
        calculator: (context, carrier) => {
          const baseCost = this.calculateBaseCost(context, carrier);
          return new Decimal(baseCost).mul(carrier.insuranceRate).toNumber();
        },
        priority: 6,
        isActive: true,
      },
      {
        id: 'handling-fee',
        name: 'Special Handling Fee',
        description: 'Additional fee for fragile or oversize items',
        condition: (context) => context.fragileItems || context.oversizeItems,
        calculator: (context, _carrier) => {
          let fee = 0;
          if (context.fragileItems) fee += 50000; // 50k VND for fragile
          if (context.oversizeItems) fee += 100000; // 100k VND for oversize
          return fee;
        },
        priority: 7,
        isActive: true,
      },
      {
        id: 'time-window-fee',
        name: 'Time Window Fee',
        description: 'Fee for specific delivery time windows',
        condition: (context) => !!context.timeWindow,
        calculator: () => 30000, // 30k VND for time window delivery
        priority: 8,
        isActive: true,
      },
    ];
  }

  private calculateChargeableVolume(context: PricingContext): number {
    // For luggage items, use actual volume since they're bulky but light
    const volumetricWeight = context.volume * this.DIMENSIONAL_FACTOR;
    return Math.max(context.weight, volumetricWeight) / this.DIMENSIONAL_FACTOR;
  }

  private calculateBaseCost(context: PricingContext, carrier: Carrier): number {
    // Calculate base cost using primary pricing method
    switch (carrier.pricingMethod) {
      case 'PER_KM':
        return carrier.baseRate + context.distance * carrier.perKmRate;
      case 'PER_M3':
        return (
          carrier.baseRate +
          this.calculateChargeableVolume(context) * carrier.perM3Rate
        );
      case 'PER_TRIP':
        return carrier.perTripRate;
      default:
        return carrier.baseRate;
    }
  }

  public calculatePricing(
    context: PricingContext,
    carrier: Carrier
  ): PricingBreakdown {
    const breakdown: PricingBreakdown = {
      baseCost: 0,
      distanceCost: 0,
      volumeCost: 0,
      weightCost: 0,
      serviceLevelSurcharge: 0,
      fuelSurcharge: 0,
      remoteAreaFee: 0,
      insuranceFee: 0,
      handlingFee: 0,
      timeWindowFee: 0,
      totalBeforeTax: 0,
      taxAmount: 0,
      finalTotal: 0,
      currency: 'VND',
    };

    // Apply all active rules in priority order
    const applicableRules = this.rules
      .filter((rule) => rule.isActive && rule.condition(context, carrier))
      .sort((a, b) => a.priority - b.priority);

    applicableRules.forEach((rule) => {
      const amount = rule.calculator(context, carrier);

      switch (rule.id) {
        case 'base-rate':
          breakdown.baseCost = amount;
          break;
        case 'distance-based':
          breakdown.distanceCost = amount;
          break;
        case 'volume-based':
          breakdown.volumeCost = amount;
          break;
        case 'service-level-surcharge':
          breakdown.serviceLevelSurcharge = amount;
          break;
        case 'fuel-surcharge':
          breakdown.fuelSurcharge = amount;
          break;
        case 'remote-area-fee':
          breakdown.remoteAreaFee = amount;
          break;
        case 'insurance-fee':
          breakdown.insuranceFee = amount;
          break;
        case 'handling-fee':
          breakdown.handlingFee = amount;
          break;
        case 'time-window-fee':
          breakdown.timeWindowFee = amount;
          break;
      }
    });

    // Calculate totals
    breakdown.totalBeforeTax = new Decimal(breakdown.baseCost)
      .add(breakdown.distanceCost)
      .add(breakdown.volumeCost)
      .add(breakdown.weightCost)
      .add(breakdown.serviceLevelSurcharge)
      .add(breakdown.fuelSurcharge)
      .add(breakdown.remoteAreaFee)
      .add(breakdown.insuranceFee)
      .add(breakdown.handlingFee)
      .add(breakdown.timeWindowFee)
      .toNumber();

    breakdown.taxAmount = new Decimal(breakdown.totalBeforeTax)
      .mul(this.TAX_RATE)
      .toNumber();

    breakdown.finalTotal = new Decimal(breakdown.totalBeforeTax)
      .add(breakdown.taxAmount)
      .toNumber();

    return breakdown;
  }

  public compareCarrierPricing(
    context: PricingContext,
    carriers: Carrier[]
  ): Array<{
    carrier: Carrier;
    pricing: PricingBreakdown;
    score: number;
  }> {
    return carriers
      .filter((carrier) => carrier.isActive)
      .map((carrier) => {
        const pricing = this.calculatePricing(context, carrier);
        const score = this.calculateCarrierScore(context, carrier, pricing);
        return { carrier, pricing, score };
      })
      .sort((a, b) => b.score - a.score); // Higher score is better
  }

  private calculateCarrierScore(
    context: PricingContext,
    carrier: Carrier,
    pricing: PricingBreakdown
  ): number {
    // Multi-criteria scoring: price (40%), rating (30%), capacity (20%), speed (10%)
    const priceScore = Math.max(0, 100 - pricing.finalTotal / 10000); // Normalize to 0-100
    const ratingScore = (carrier.rating / 5) * 100;
    const capacityScore = Math.min(
      100,
      (carrier.maxVolume >= context.volume ? 50 : 0) +
        (carrier.maxWeight >= context.weight ? 50 : 0)
    );
    const speedScore =
      context.serviceLevel === 'EXPRESS'
        ? carrier.name.includes('Express')
          ? 100
          : 70
        : 80;

    return (
      priceScore * 0.4 +
      ratingScore * 0.3 +
      capacityScore * 0.2 +
      speedScore * 0.1
    );
  }

  public addCustomRule(rule: PricingRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  public updateRule(ruleId: string, updates: Partial<PricingRule>): void {
    const ruleIndex = this.rules.findIndex((rule) => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    }
  }

  public removeRule(ruleId: string): void {
    this.rules = this.rules.filter((rule) => rule.id !== ruleId);
  }
}

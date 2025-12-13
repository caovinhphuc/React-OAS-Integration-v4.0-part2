export interface GeneticAlgorithmConfig {
  populationSize: number;
  maxGenerations: number;
  crossoverRate: number;
  mutationRate: number;
  tournamentSize: number;
  elitismRate: number;
}

export interface Individual {
  genes: any[];
  fitness: number;
}

export abstract class GeneticAlgorithm {
  protected config: GeneticAlgorithmConfig;
  protected population: Individual[] = [];

  constructor(config: Partial<GeneticAlgorithmConfig> = {}) {
    this.config = {
      populationSize: 50,
      maxGenerations: 100,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      tournamentSize: 20,
      elitismRate: 0.1,
      ...config,
    };
  }

  abstract createIndividual(): Individual;
  abstract calculateFitness(individual: Individual): number;
  abstract crossover(parent1: Individual, parent2: Individual): Individual;
  abstract mutate(individual: Individual): Individual;

  initializePopulation(): void {
    this.population = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      const individual = this.createIndividual();
      individual.fitness = this.calculateFitness(individual);
      this.population.push(individual);
    }
    this.sortPopulation();
  }

  evolve(): Individual {
    for (
      let generation = 0;
      generation < this.config.maxGenerations;
      generation++
    ) {
      const newPopulation: Individual[] = [];

      // Elitism: Keep best individuals
      const eliteCount = Math.floor(
        this.config.populationSize * this.config.elitismRate
      );
      for (let i = 0; i < eliteCount; i++) {
        newPopulation.push({ ...this.population[i] });
      }

      // Generate new individuals
      while (newPopulation.length < this.config.populationSize) {
        const parent1 = this.tournamentSelection();
        const parent2 = this.tournamentSelection();

        let child: Individual;
        if (Math.random() < this.config.crossoverRate) {
          child = this.crossover(parent1, parent2);
        } else {
          child = { ...parent1 };
        }

        if (Math.random() < this.config.mutationRate) {
          child = this.mutate(child);
        }

        child.fitness = this.calculateFitness(child);
        newPopulation.push(child);
      }

      this.population = newPopulation;
      this.sortPopulation();

      // Early termination if no improvement
      if (
        generation > 20 &&
        this.population[0].fitness === this.population[1].fitness
      ) {
        break;
      }
    }

    return this.population[0];
  }

  private tournamentSelection(): Individual {
    const tournament: Individual[] = [];

    for (let i = 0; i < this.config.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }

    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }

  private sortPopulation(): void {
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  getBestIndividual(): Individual {
    return this.population[0];
  }

  getAverageFitness(): number {
    const totalFitness = this.population.reduce(
      (sum, individual) => sum + individual.fitness,
      0
    );
    return totalFitness / this.population.length;
  }

  getPopulationStats(): {
    best: number;
    average: number;
    worst: number;
  } {
    return {
      best: this.population[0].fitness,
      average: this.getAverageFitness(),
      worst: this.population[this.population.length - 1].fitness,
    };
  }
}

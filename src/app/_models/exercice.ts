import { Deserializable } from './deserializable.model';
import { Grille } from './grille';
import { Question } from './question';
import { Critere } from './critere';
import { Freetext } from './freetext';

export class Exercice implements Deserializable {
  id: string;
  title: string;
  questions: any[];
  className: string;
  visible: boolean;

  constructor() {
    this.className = 'Exercice';
    this.questions = [];
    this.visible = false;
  }

  // Convert from JSON
  deserialize(input: any, grille?: Grille) {
    this.id = input.id;
    this.title = input.title;
    this.questions = [];
    for (const key of Object.keys(input.questions)) {
      if (input.questions[key].type === 'que') {
        this.questions.push(new Question().deserialize(input.questions[key], grille));
      }
      if (input.questions[key].type === 'free') {
        this.questions.push(new Freetext().deserialize(input.questions[key]));
      }
    }
    return this;
  }

  // Convert to JSON
  serialize(): any {
    let serializeExe = {
      id: this.id,
      title: this.title,
      type: 'exe',
      questions: []
    };
    for (const question of this.questions) {
      serializeExe.questions.push(question.serialize());
    }
    return serializeExe;
  }

  // Compute bareme from all inner questions
  get bareme(): number {
    let bareme = 0;
    for (const question of this.questions) {
      bareme += question.bareme ? question.bareme : 0;
    }
    return bareme;
  }

  get criteres(): Critere[] {
    let criteres = [];
    for (const question of this.questions) {
      if (question.criteres) {
        for (const critere of question.criteres) {
          criteres.push(critere);
        }
      }
    }
    return criteres;
  }

  // Get a criteria anywhere in the exerice
  getCritere(questionId: string, critereId: string): Critere {
    if (this.questions !== undefined) {
      for (const que of this.questions) {
        if (que.id === questionId) {
          return que.getCritere(critereId);
        }
      }
    }
    return null;
  }

  isCapaciteUsed(capacite: any): boolean {
    for (const question of this.questions) {
      if (question.isCapaciteUsed(capacite)) {
        return true;
      }
    }
    return false;
  }

  getCapaciteBilan(capaciteBilan: any): any {
    for (const question of this.questions) {
      question.getCapaciteBilan(capaciteBilan);
    }
  }

}

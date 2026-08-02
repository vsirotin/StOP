import { Artifact } from './types';
import { IArtifactBox } from './interfaces';

export class ArtifactBoxSim implements IArtifactBox {
  readonly storedItems: Artifact[] = [];

  receive(artifact: Artifact): void {
    this.storedItems.push(artifact);
  }

  retrieve(): Artifact | undefined {    // UC 7.5: service worker retrieves artifact
    return this.storedItems.pop();
  }
}

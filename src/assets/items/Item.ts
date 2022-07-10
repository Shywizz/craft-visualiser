import type { BaseItem } from 'E:/dev/mc-gatherer/src/api'

export interface Link {
  weight: number
  source: Item
  target: Item
}

export interface Item extends BaseItem {}
export class Item {
  /** How many items you need to craft */
  public get usability() { return 0 }

  /** How many times used as catalyst */
  public get popularity() { return 0 }

  public get inputsAmount() { return 0 }
  public get outputsAmount() { return 0 }
  public get mainInputs(): Link[] { throw new Error('Getter unimplemented') }
  public get mainOutputs(): Link[] { throw new Error('Getter unimplemented') }

  href!: string

  init(base: BaseItem) {
    Object.assign(this, base)
    this.href = getImagePath(this.id)
    return this
  }
}

const imagePath = 'https://github.com/Krutoy242/E2E-E-icons/raw/main/x32'

function getImagePath(id: string) {
  return id.includes('{')
    ? ''
    : `${imagePath}/${id.replace(/:/g, '__')}.png`
}

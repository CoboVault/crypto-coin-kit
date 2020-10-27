import  {TCFX} from '../TCFX/index'


export class  CFX extends TCFX {
    constructor(chainId?: number ) {
        super(chainId || 1029)
    }
}

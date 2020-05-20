// @ts-ignore
import {Script} from 'zcore-lib';
import {AdaptedInput, Input} from './index';

export default (inputs: Input[]): AdaptedInput[] => {
  return inputs.map(item => ({
    ...item,
    script: Script.buildPublicKeyHashOut(item.address).toString(),
  }));
};

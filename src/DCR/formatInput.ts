// @ts-ignore
import {Script} from 'dcr-core';
import {AdaptedInput, Input} from './index';

export default (inputs: Input[]): AdaptedInput[] => {
  return inputs.map(item => ({
    ...item,
    script: Script.buildPublicKeyHashOut(item.address).toString(),
  }));
};

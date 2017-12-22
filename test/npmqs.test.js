import { assert } from 'chai';

import ModuleMaker from '../src/lib/npmqs';

describe('new ModuleMaker', () => {
  it('should be an instance of ModuleMaker', () => {
    let module = new ModuleMaker('project');
    console.log(module instanceof ModuleMaker);
  });
});
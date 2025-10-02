import Storehouse from '../../src/index';
import { MapManager, ModelType } from './mapManager'
import { expect } from 'chai';

interface User {
  name: string;
  address?: string;
}

describe('Storehouse', function() {
  it('should be aiight', async function()  {
    // settings
    Storehouse.setManagerType(MapManager);
    Storehouse.add({
      novice_mapping: {
        type: 'mapping',
        config: {
          message: 'starting'
        }
      }
    });

    // insert user
    const model = Storehouse.getModel<ModelType<User>>('users');
    if (model) {
      model.set('id1234', { name: 'keeper' });
    }
    
    // get user
    let userName = '';
    const mapping = Storehouse.getManager<MapManager>(/* 'mapping' */);
    expect(mapping).to.not.be.undefined;
    if (mapping) {
      expect(mapping.name).to.equal('novice_mapping');
      const user = mapping.getModel<User>('users').get('id1234');  
      expect(user).to.be.an('object');
      if (user) {
        userName = user.name;
      }
    }

    expect(userName).to.be.a('string')
        .and.equals('keeper');
    
    // close all connections
    await Storehouse.close();

    expect(Storehouse.managerNames)
      .to.be.an('array')
      .that.includes('novice_mapping')
      .and.to.have.lengthOf(1);

    // remove manager
    Storehouse.removeManager('novice_mapping');

    expect(Storehouse.managerNames)
      .to.be.an('array')
      .that.is.empty;

    Storehouse.add({
      anotherone: {
        type: 'mapping',
        config: {
          message: 'starting'
        }
      }
    });

    expect(Storehouse.managerNames)
      .to.be.an('array')
      .that.includes('anotherone')
      .and.to.have.lengthOf(1);

    // close and remove all
    await Storehouse.destroy();

    expect(Storehouse.managerNames)
      .to.be.an('array')
      .that.is.empty;
  });
});

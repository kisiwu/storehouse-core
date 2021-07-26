import Storehouse from '../../src/index';
import { MapManager, ModelType } from './mapManager'
import { expect } from 'chai';

interface User {
  name: string;
  address?: string;
}

describe('Storehouse', () => {
  it('should be aiight', (done) => {
    // settings
    Storehouse.setManagerType(MapManager);
    Storehouse.add({
      mapping: {
        type: 'mapping'
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
    if (mapping) {
      const user = mapping.getModel<User>('users').get('id1234');  
      expect(user).to.be.an('object');
      if (user) {
        userName = user.name;
      }
    }

    expect(userName).to.be.a('string')
        .and.equals('keeper');
    
    
    // close all connections
    Storehouse.close();

    done();
  });
});

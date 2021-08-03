/*
import Storehouse from '../../src/index';
import { MapManager, ModelType } from './mapManager'
import { expect } from 'chai';
*/
const Storehouse = require('../../lib/index');
const MapManager = require('./mapManager');

describe('Storehouse', () => {
  it('should be aiight', async () => {
    // settings
    Storehouse.setManagerType(MapManager);
    Storehouse.add({
      mapping: {
        type: 'mapping'
      }
    });

    // insert user
    const model = Storehouse.getModel('users');
    if (model) {
      model.set('id1234', { name: 'keeper' });
    }
    
    // get user
    let userName = '';
    const mapping = Storehouse.getManager(); // default = 'mapping'
    if (mapping) {
      const user = mapping.getModel('users').get('id1234');  
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
      .that.includes('mapping')
      .and.to.have.lengthOf(1);

    // remove manager
    Storehouse.removeManager('mapping');

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

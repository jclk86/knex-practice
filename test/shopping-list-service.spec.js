const shoppingListService = require('../src/shopping-list-service');
const knex = require('knex');
const {expect} = require('chai');

describe('Shopping List Object', () => {
  let db;
  let testGroceryList = [
    {
      id: 1,
      name: 'item 1',
      price: "9.99",
      date_added: new Date('2019-07-12T20:54:31.372677'),
      category: 'Breakfast'
    },
    {
      id: 2,
      name: 'item 2',
      price: "17.99",
      date_added: new Date('2019-07-12T20:54:31.372677'),  
      category: 'Lunch'
    },
    {
      id: 3,
      name: 'item 3',
      price: "31.99",
      date_added: new Date('2019-07-12T20:54:31.372677'), 
      category: 'Main'
    },
    {
      id: 4, 
      name: 'item 4',
      price: "2.99",
      date_added: new Date('2019-07-12T20:54:31.372677'),
      category: 'Snack'
    }
  ];
  
  // create query object 
  before(() => { 
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  });
  // clean up before and after
  before(() => db('shopping_list').truncate());

  afterEach(() => db('shopping_list').truncate());

  // After all code is run, destroy connection to database
  after(() => db.destroy());

  context('Given shopping_list has data', () => {
    // Since before/after each test, the table is cleaned up. This inserts the content again. 
    beforeEach(() => {
      return db.into('shopping_list').insert(testGroceryList);
    });

    // Get entire list test
    it(`getAllItems() resolves all items from 'shopping_list' table`, () => {
      const expectedItems = testGroceryList.map(item => ({
        ...item,
        checked: false,
      }))
      return shoppingListService.getAllItems(db)
        .then(actual => {
          expect(actual).to.eql(expectedItems)
        })
    })
    // set an id value. 
    it("getById() resolves item via id from shopping_list", () => {
      const idToGet = 2;
      const secondItem = testGroceryList[idToGet - 1];
      return shoppingListService.getById(db, idToGet)
      .then(actual => {
        expect(actual).to.eql({
          id: idToGet,
          name: secondItem.name,
          date_added: secondItem.date_added,
          price: secondItem.price,
          category:secondItem.category,
          checked: false
        })
      })
    })
    // the delete method accesses the table. Uses where() to find id of object. Then delete() deletes it. 
    // the BeforeEach inserts the testGroceryList into each test
    // below: get id number. The delete item from table. This alters the 
    // testGroceryList table in this instance of the DB. 
    //Then getAllItems gets all of the remaining items using filter, which makes sure that item isn't still there. This makes up the argument we need to pass into the expected to compare to the original data passed on in promise -- allItems. The tables are compared. 
    it(`deleteItem() removes an article by id from 'shopping_list' table`, () => {
      const itemId = 5;
      return shoppingListService.deleteItem(db, itemId)
        .then(() => shoppingListService.getAllItems(db))
        .then(allItems => {
          const expected = testGroceryList
            .filter(item => item.id !== itemId)
            .map(item => ({
              ...item, 
              checked: false,
            }))
            expect(allItems).to.eql(expected);
        })
    })

    it(`updateItem() updates an article from the 'shopping_list' table`, () => {
      const idOfItemToUpdate = 3; 
      const newItem = {
        name: 'Updated title',
        price: '800.00',
        date_added: new Date(),
        checked: true,
      }
      const originalItem = testGroceryList[idOfItemToUpdate - 1]
      return shoppingListService.updateItem(db,idOfItemToUpdate, newItem)
      .then(() => shoppingListService.getById(db, idOfItemToUpdate))
      .then(item => {
        expect(item).to.eql({
          id: idOfItemToUpdate,
          ...originalItem,
          ...newItem,
        })
      })
    })
  })

  context(`Given 'shopping_list' has no data`, () => {
    it(`getAllItems() resolves an empty array`, () => {
      return shoppingListService.getAllItems(db)
        .then(actual => {
          expect(actual).to.eql([])
        })
    })

    it(`insertItem() inserts an item and resolves the item with an 'id'`, () => {
      const newItem = {
        name: 'Test new name name',
        price: '5.05',
        date_added: new Date('2020-01-01T00:00:00.000Z'),
        checked: true,
        category: 'Lunch',
      }
      return shoppingListService.insertItem(db, newItem)
        .then(actual => {
          expect(actual).to.eql({
            id: 1,
            name: newItem.name,
            price: newItem.price,
            date_added: newItem.date_added,
            checked: newItem.checked,
            category: newItem.category
          })
        })
    })
  })
})

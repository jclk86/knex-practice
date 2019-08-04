require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
  client: 'pg',
  connection: `postgresql://postgres:B3Th3B3st@localhost/knex-practice`
});

function searchByGroceryName(searchTerm) {
  knexInstance 
  .select('id', 'name', 'price', 'category', 'date_added', 'checked')
  .from('shopping_list')
  .where('name', 'ILIKE', `%${searchTerm}%`)
  .then(result => {
    console.log(result);
  })
}

// searchByGroceryName('burger');
// select -- columns i want to see. where = filters

function paginateShoppingItems(pageNumber) {
  const ItemsPerPage = 6;
  const offset = ItemsPerPage * (pageNumber - 1); // start from 0
  knexInstance
    .select('id', 'name', 'price', 'category', 'date_added', 'checked')
    .from('shopping_list')
    .limit(ItemsPerPage)
    .offset(offset)
    .then(result => {
      console.log(result);
    });
};

// paginateShoppingItems(2);

function getItemsAfterDate(daysAgo) {
  knexInstance
    .select('id', 'name', 'price', 'category', 'date_added')
    .where(
      'date_added',
      '<',
      knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
    )
    .from('shopping_list')
    .orderBy([
      { column: 'date_added', order: 'ASC' }
    ])
    .then(result => {
      console.log(result)
    })
};

// getItemsAfterDate(5);

function getCategoryTotalCost() {
  knexInstance
    .select('category')
    .from('shopping_list')
    .groupBy('category') // this part is important
    .sum('price AS total')
    .then(result => {
      console.log('Cost per category');
      console.log(result)
    })
}
getCategoryTotalCost();
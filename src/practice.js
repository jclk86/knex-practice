require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
  client: 'pg',
  connection: 'postgresql://postgres:B3Th3B3st@localhost/knex-practice'
});

// NOTE: whenever you need to access a table, create an instance of it and then chain. 

// building queries that do the same as SELECT * FROM TABLE
// knexInstance returns a promise-like object.
// it's not a promise bc it has more methods than the then(), catch(), and finally(). It has from(), toQuery() and select(). 
knexInstance.from('amazong_products').select('product_id', 'name', 'price', 'category')
  .from('amazong_products')
  .where({name: 'Point of view gun'})
  // get first item back matching and takes out of array. 
  .first()
  .then(result => {
    console.log(result);
  });

function searchByProduceName(searchTerm) {
  knexInstance 
  .select('product_id', 'name', 'price', 'category')
  .from('amazong_products')
  .where('name', 'ILIKE', `%${searchTerm}%`)
  .then(result => {
    console.log(result);
  })
}

searchByProduceName('holo');

// offset is where count begins. limit is # of products per page. 
function paginateProducts(page) {
  const productsPerPage = 10;
  const offset = productsPerPage * (page - 1); // start from 0
  knexInstance
    .select('product_id', 'name', 'price', 'category')
    .from('amazong_products')
    .limit(productsPerPage)
    .offset(offset)
    .then(result => {
      console.log(result);
    });
};

paginateProducts(2);

function getProductWithImages() {
  knexInstance
    .select('product_id', 'name', 'price', 'category', 'image')
    .from('amazong_products')
    .whereNotNull('image') // image is a column
    .then(result => {
      console.log(result);
    });
};

getProductWithImages();

// the ?? stands for user input 
// .raw() for arbitrary sql query in schema building chain. 
function mostPopularVideosForDays(days) {
  knexInstance
    .select('video_name', 'region')
    .count('date_viewed AS views')
    .where(
      'date_viewed',
      '>',
      knexInstance.raw(`now() - '?? days'::INTERVAL`, days)
    )
    .from('whopipe_video_views')
    .groupBy('video_name', 'region')
    .orderBy([
      { column: 'region', order: 'ASC' },
      { column: 'views', order: 'DESC' },
    ])
    .then(result => {
      console.log(result)
    })
}

mostPopularVideosForDays(30)

// const q1 = knexInstance.from('amazong_products').select('*').toQuery();

// const q2 = knexInstance('amazong_products').select('*').toQuery();

// console.log('q1:', q1);
// console.log('q2:', q2);

// const qry = knexInstance.from('amazong_products').select('product_id', 'name', 'price', 'category')
// .from('amazong_products')
// .where({name: 'Point of view gun'})
// // get first item back matching and takes out of array. 
// .first()
// .toQuery();
// console.log('query in CMD:', qry);
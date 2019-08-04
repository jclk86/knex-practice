const ArticlesService = require('../src/articles-service');
const knex = require('knex');
const {expect} = require('chai');


describe('Articles service object', function() {
  let db;
  let testArticles = [
    {
      id: 1,
      region: 'West',
      date_published: new Date('2029-01-22T16:28:32.615Z'),
      title: 'First test post!',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
    },{
      id: 2,
      region: 'West',
      date_published: new Date('2100-05-22T16:28:32.615Z'),
      title: 'Second test post!',
      content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
    },{
      id: 3,
      region: 'West',
      date_published: new Date('1919-12-22T16:28:32.615Z'),
      title: 'Third test post!',
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus, voluptate? Necessitatibus, reiciendis? Cupiditate totam laborum esse animi ratione ipsa dignissimos laboriosam eos similique cumque. Est nostrum esse porro id quaerat.'
    }
  ];


  before(() => { //runs before any 'it' tests. 
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  // the orders of the before() matters below. 
  // this looks unusual. The db().
  // closures? 
  before(() => db('blogful_articles').truncate());

  // for each test run, it cleans up after itself so it doesn't affect the other tests
  afterEach(() => db('blogful_articles').truncate())
  // when a database connection is open, Node process think the script will want to stay running while the connection is open. 
  // Thus, you need to destroy the connection with destroy() to close the connection. Without this, if you run npm test, it will hang. 
  after(() => db.destroy());
 
  // Context is the same as describe, only used here for semantic purposes. This describe block tests array if array has content. Below tests with no content. 
  context(`Given 'blogful_articles' has data`, () => {
     // the into() .insert() works to seed table content into table for testing purposes. This below needs to be inside this describe/context scope because we want test to pass if no data in array, which is the below describe block. 
    beforeEach(() => {
      return db.into('blogful_articles').insert(testArticles)
    });

    it(`updateArticle() updates an article from the 'blogful_articles' table`, () => {
      const idOfArticleToUpdate = 3;
      const newArticleData = {
        title: 'update title',
        region: 'West',
        content: 'update content',
        date_published: new Date()
      }
      return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
      .then(() => ArticlesService.getById(db,idOfArticleToUpdate))
      .then(article => {
        expect(article).to.eql({
          id: idOfArticleToUpdate,
          ...newArticleData
        })
      })
    })

    it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
      const articleId = 3;
      return ArticlesService.deleteArticle(db, articleId)
        .then(() => ArticlesService.getAllArticles(db))
        .then(allArticles => {
          // copy the test articles without the "deleted" article
          const expected = testArticles.filter(article => article.id !== articleId);
          expect(allArticles).to.eql(expected);
        })
    });


    it(`getAllArticles() resolves all articles from 'blogful_articles' table`, () => {
      // test that ArticlesService.getAllArticles gets data from table
      // the db as a parameter is the injection of the database mentioned in articles-service.js. That knex is just a parameter, the db below, as you can see with the db defined above, is the actualy injection of the database from the knex instance. 
      return ArticlesService.getAllArticles(db).then(actual => {
        expect(actual).to.eql(testArticles.map(article => ({
          ...article,
          date_published: new Date(article.date_published)
        }))) // this requires the original js file's function to have return a promise, b/c then() only works to resolve promises. 
      })
    })

    it(`getById() resolves an article by id from 'blogful_articles' table`, () => {
        const thirdId = 3;
        const thirdTestArticle = testArticles[thirdId - 1];
        return ArticlesService.getById(db, thirdId)
        .then(actual => {
          expect(actual).to.eql({
            id: thirdId,
            region: thirdTestArticle.region,
            title:thirdTestArticle.title,
            content: thirdTestArticle.content,
            date_published: thirdTestArticle.date_published
          })
        })
    })
  });

  // tests with no content in array. Above tests with content in array 
  context(`Given 'blogful_articles' has no data`, () => {
    it(`getAllArticles() resolves an empty array`, () => {
      return ArticlesService.getAllArticles(db)
      .then(actual => {
        expect(actual).to.eql([]);
      })
    })
    it(`insertArticle() inserts a new article and resolves the new article with an 'id'`, () => {
      const newArticle = {
        title: 'Test new title',
        region: 'West',
        content: 'Test new content',
        date_published: new Date('2020-01-01T00:00:00.000Z'),
      }
      return ArticlesService.insertArticle(db, newArticle)
      .then(actual => {
        expect(actual).to.eql({
          id:1,
          region: newArticle.region,
          title: newArticle.title,
          content: newArticle.content,
          date_published: new Date(newArticle.date_published)
        })
      })
    })
  })
});
// above, you map through the array because you're getting the exact Date() 
// these tests should not alter main table/database. So create a new database and new test_DB_URL in ENV file. 

// ANYTIME you see expect[], it likely has to do with before() and after() or beforeEach() and afterEach()
const shoppingListService = {
  getAllItems(knex) {
    return knex.select('*').from('shopping_list')
  },
  getById(knex, id) {
    return knex
      .from('shopping_list')
      .select('*')
      .where('id', id)
      .first()
  },
  deleteItem(knex, id) {
    return knex
      .from('shopping_list')
      .where({id})
      .delete()
  },
  updateItem(knex, id, newItemFields) {
    return knex
    .from('shopping_list')
    .where({id})
    .update(newItemFields)
  },
  insertItem(knex, newItem) {
    return knex
      .insert(newItem)
      .into('shopping_list')
      .returning('*')
      .then(rows => rows[0]) // takes it out of the array and returns an object for proper comparison
  }
}

module.exports = shoppingListService;
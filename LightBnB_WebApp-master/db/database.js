const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
  .query('SELECT * FROM users WHERE email = $1')
  .then((result) => {
    console.log(result);
    return Promise.resolve(result);
  })
  .catch((err) => {
    console.log(err.message);
  });






  /*let resolvedUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user && user.email.toLowerCase() === email.toLowerCase()) {
      resolvedUser = user;
    }
  }
  return Promise.resolve(resolvedUser); */
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
  .query('SELECT * FROM users WHERE id = $1')
  .then((result) => {
    console.log(result);
    return Promise.resolve(result);
  })
  .catch((err) => {
    console.log(err.message);
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
  .query('INSERT INTO users (name, password, email) VALUES ${user.name}, ${user.password}, ${user.email} RETURNING *')
  .then((result) => {
    console.log(result);
    return Promise.resolve(result);
  })
  .catch((err) => {
    console.log(err.message);
  });



 /*const userId = Object.keys(users).length + 1;
  user.id = userId;
  users[userId] = user;
  return Promise.resolve(user); */
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
  .query('SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating',
  'FROM reservations',
  'JOIN properties ON reservations.property_id = properties.id',
  'JOIN property_reviews ON properties.id = property_reviews.property_id',
  'WHERE reservations.guest_id = $1',
  'GROUP BY properties.id, reservations.id',
  'ORDER BY reservations.start_date',
  'LIMIT 10 RETURNING *;')
  .then((result) => {
    return Promise.resolve(result);
  })
  .catch((err) => {
    console.log(err.message);
  });
  
  
  /*
  return getAllProperties(null, 2); */
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  
  const queryParams = [];
  
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city && !options.owner_id) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  if (options.owner_id && !options.city) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += `WHERE owner_id LIKE $${queryParams.length} `;
  }
  if (options.owner_id && options.city) {
    queryParams.push(`%${options.owner_id}%`);
    queryString += `WHERE owner_id LIKE $${queryParams.length} `;
    queryParams.push(`%${options.city}%`);
    queryString += `AND WHERE city LIKE $${queryParams.length} `;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(`%${options.minimum_price_per_night}%`);
    queryString += `WHERE minimum_price_per_night <= $${queryParams.length} `;
  }


  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;


  return pool.query(queryString, queryParams).then((res) => res.rows);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  return pool
  .query('INSERT INTO properties (owner_id, title, description, thumnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ${property.owner_id}, ${property.title}, ${property.description}, ${property.thumbmail_photo_url}, ${property.cover_photo_url}, ${property.cost_per_night}, ${property.street}, ${property.city}, ${property.province}, ${property.post_code}, ${property.country}, ${property.parking_spaces}, ${property.number_of_bathrooms}, ${property.number_of_bedrooms} RETURNING *')
  .then((result) => {
    return Promise.resolve(result);
  })
  .catch((err) => {
    console.log(err.message);
  });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};

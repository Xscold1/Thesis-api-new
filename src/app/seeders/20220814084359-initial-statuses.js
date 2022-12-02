'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     return queryInterface.bulkInsert('Statuses', [{
      status: 'P',
      status_long: 'PENDING',
    },
    {
      status: 'AP',
      status_long: 'APPROVED',
    },
    {
      status: 'A',
      status_long: 'ACTIVE',
    }, 
    {
      status: 'I',
      status_long: 'INACTIVE',
    },
    {
      status: 'D',
      status_long: 'DELETED',
    },
    {
      status: 'DE',
      status_long: 'DEACTIVATED',
    },
    {
      status: 'S',
      status_long: 'SUCCESS',
    },
    {
      status: 'F',
      status_long: 'Internal Server Error',
    }
  ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return queryInterface.bulkDelete('Statuses', null, {});
  }
};

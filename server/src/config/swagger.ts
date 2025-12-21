import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FPH CRM API',
      version: '1.0.0',
      description: 'Personal Contact Relationship Manager API - Track contacts, interactions, reminders, and more',
      contact: {
        name: 'API Support',
        email: 'drmitchell85@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.fph-crm.com',
        description: 'Production server (future)'
      }
    ],
    tags: [
      {
        name: 'Contacts',
        description: 'Contact management endpoints'
      },
      {
        name: 'Interactions',
        description: 'Interaction tracking endpoints'
      },
      {
        name: 'Reminders',
        description: 'Reminder and follow-up management endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);

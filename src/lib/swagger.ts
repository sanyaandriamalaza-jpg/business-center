import swaggerJSDoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Projet : Centre d‘affaire - Link Apps Services",
      version: "1.0.0",
      description: "Documentation des APIs utilisées pour le projet",
    },
    servers: [
      // {
      //   url: "https://api.example.com",
      //   description: "Serveur de production",
      // },
      {
        url: "http://localhost:3000",
        description: "Serveur de développement local",
      },
    ],
    tags: [
      {
        name: "auth",
        description: "Opérations liées à l’authentification",
      },
      {
        name: "user",
        description: "Opérations liées aux informations concernant les utilisateurs : basic, admin, super-admin",
      },
    ]
  },
  apis: ["./app/api/**/*.ts", "./app/api/**/*.tsx"],
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
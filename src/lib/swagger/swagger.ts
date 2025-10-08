import swaggerJSDoc from "swagger-jsdoc"
import schemas from "@/src/lib/swagger/schemas"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Projet : Clé-o - Link Apps Services",
      version: "1.0.0",
      description: "Documentation des APIs utilisées pour le projet",
    },
    components: {
      schemas: schemas,
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de développement local",
      },
      {
        url: "https://cle-o.codipend.com",
        description: "Serveur de production",
      },
    ],
    tags: [
      {
        name: "auth",
        description: "Opérations liées à l’authentification",
      },
      {
        name: "admin",
        description: "Opérations liées aux informations concernant les utilisateurs de type admin",
      },
      {
        name: "super-admin",
        description: "Opérations liées aux informations concernant les utilisateurs de type super-admin",
      },
      {
        name: "logs",
        description: "Opérations liées au journal d'activité, permettant de tracer toutes les actions réalisées dans l'application, par qui et à quel moment.",
      },
      {
        name: "color-theme",
        description: "Opérations liées à la gestion des palettes de couleurs utilisées dans l'application (ajout, suppression, mise à jour, récupération).",
      },
      {
        name: "company",
        description: "Opérations liées à la gestion des entreprises : création, mise à jour, suppression et consultation des informations d'une entreprise.",
      },
    ]
  },
  apis: ["./src/app/api/**/route.ts", "./src/app/api/**/route.tsx"]
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
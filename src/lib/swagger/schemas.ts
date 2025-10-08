
const schemas = {
    BasicUser: {
        type: "object",
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Martin" },
            firstName: { type: "string", example: "Pierre" },
            email: { type: "string", format: "email", example: "pierre.martin@example.com" },
            phone: { type: "string", nullable: true, example: "+33123456789" },
            addressLine: { type: "string", nullable: true, example: "10 rue de la Paix" },
            city: { type: "string", nullable: true, example: "Paris" },
            state: { type: "string", nullable: true, example: "Île-de-France" },
            postalCode: { type: "string", nullable: true, example: "75001" },
            country: { type: "string", nullable: true, example: "France" },
            profilePictureUrl: {
                type: "string",
                format: "uri",
                nullable: true,
                example: "https://example.com/avatar.png",
            },
            createdAt: { type: "string", format: "date-time", example: "2025-08-18T10:00:00Z" },
            updatedAt: { type: "string", format: "date-time", nullable: true, example: "2025-08-18T12:00:00Z" },
            isBanned: { type: "boolean", nullable: true, example: false },
            idCompany: { type: "integer", example: 2 },
        },
        required: ["id", "name", "firstName", "email", "createdAt", "idCompany"],
    },
    SuperAdminUser: {
        type: "object",
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Doe" },
            firstName: { type: "string", example: "John" },
            email: { type: "string", format: "email", example: "john.doe@example.com" },
            profilePictureUrl: {
                type: "string",
                format: "uri",
                nullable: true,
                example: "https://example.com/avatar.jpg",
            },
            createdAt: { type: "string", format: "date-time", example: "2025-07-10T12:00:00Z" },
            updatedAt: { type: "string", format: "date-time", nullable: true, example: "2025-07-11T15:30:00Z" },
            isBanned: { type: "boolean", nullable: true, example: false },
        },
        required: ["id", "name", "firstName", "email", "createdAt"],
    },
    AdminUser: {
        type: "object",
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Doe" },
            firstName: { type: "string", example: "John" },
            email: { type: "string", format: "email", example: "john.doe@example.com" },
            phone: { type: "string", nullable: true, example: "+33612345678" },
            profilePictureUrl: {
                type: "string",
                format: "uri",
                nullable: true,
                example: "https://example.com/avatar.jpg",
            },
            createdAt: { type: "string", format: "date-time", example: "2025-07-10T12:00:00Z" },
            updatedAt: { type: "string", format: "date-time", nullable: true, example: "2025-08-13T12:00:00Z" },
            isBanned: { type: "boolean", nullable: true, example: false },
            idCompany: { type: "integer", example: 2 },
            subRole: { type: "string", nullable: true, example: "manager" },
            companyInfo: {
                nullable: true,
                $ref: "#/components/schemas/Company",
            },
        },
        required: ["id", "name", "firstName", "email", "idCompany"],
    },

    ColorTheme: {
        type: "object",
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Thème Sombre" },
            backgroundColor: { type: "string", example: "#000000" },
            foregroundColor: { type: "string", example: "#ffffff" },
            createdAt: { type: "string", format: "date-time", example: "2024-07-10T12:00:00Z" },
        },
        required: ["id", "name", "backgroundColor", "foregroundColor", "createdAt"],
    },
    SocialLinkItem: {
        type: "object",
        properties: {
            label: {
                type: "string",
                enum: ["facebook", "linkedin", "instagram", "tiktok", "whatsapp"],
                description: "Type de réseau social",
                example: "facebook"
            },
            link: {
                type: "string",
                format: "uri",
                description: "Lien vers le profil ou la page sur le réseau social",
                example: "https://facebook.com/entreprise"
            }
        },
        required: ["label", "link"]
    },
    SocialLinks: {
        type: "array",
        nullable: true,
        description: "Liste des liens vers les réseaux sociaux",
        items: {
            $ref: "#/components/schemas/SocialLinkItem"
        }
    },
    Company: {
        type: "object",
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Acme Corp" },
            slug: { type: "string", example: "acme-corp" },
            description: { type: "string", nullable: true, example: "Une entreprise exemple" },
            legalForm: { type: "string", nullable: true, example: "SARL" },
            siren: { type: "string", nullable: true, example: "123456789" },
            siret: { type: "string", nullable: true, example: "12345678900012" },
            logoUrl: {
                type: "string",
                format: "uri",
                nullable: true,
                example: "https://example.com/logo.png",
            },
            phone: { type: "string", nullable: true, example: "+33123456789" },
            socialLinks: {
                $ref: "#/components/schemas/SocialLinkItem"
            },
            addressLine: {
                type: "string",
                nullable: true,
                example: "12 Rue de la Folie Méricourt",
            },
            postal_code: {
                type: "string",
                nullable: true,
                example: "75011",
            },
            city: {
                type: "string",
                nullable: true,
                example: "Paris",
            },
            state: {
                type: "string",
                nullable: true,
                example: "Île-de-France",
            },
            country: {
                type: "string",
                nullable: true,
                example: "France",
            },
            businessHour: {
                $ref: "#/components/schemas/BusinessHour",
            },
            googleMapIframe: {
                type: "string",
                nullable: true,
                example: "<iframe src='https://www.google.com/maps/embed?...'></iframe>",
            },
            reservationIsActive: { type: "boolean", nullable: true, example: true },
            managePlanIsActive: { type: "boolean", nullable: true, example: false },
            virtualOfficeIsActive: { type: "boolean", nullable: true, example: true },
            postMailManagementIsActive: { type: "boolean", nullable: true, example: false },
            digicodeIsActive: { type: "boolean", nullable: true, example: true },
            mailScanningIsActive: { type: "boolean", nullable: true, example: false },
            electronicSignatureIsActive: { type: "boolean", nullable: true, example: true },
            isBanned: { type: "boolean", nullable: true, example: false },
            createdAt: { type: "string", format: "date-time", nullable: true, example: "2025-07-10T12:00:00Z" },
            updatedAt: { type: "string", format: "date-time", nullable: true, example: "2025-07-11T12:00:00Z" },
            adminUserList: {
                type: "array",
                nullable: true,
                description: "Liste des admins du centre d‘affaire",
                items: {
                    $ref: "#/components/schemas/AdminUser"
                }
            },
            theme: {
                $ref: "#/components/schemas/ColorTheme"
            }
        },
        required: ["id", "name"],
    },
    BusinessHour: {
        type: "object",
        description: "Représente les heures d'ouverture et de fermeture pour chaque jour de la semaine.",
        properties: {
            monday: { $ref: "#/components/schemas/DailyBusinessHour" },
            tuesday: { $ref: "#/components/schemas/DailyBusinessHour" },
            wednesday: { $ref: "#/components/schemas/DailyBusinessHour" },
            thursday: { $ref: "#/components/schemas/DailyBusinessHour" },
            friday: { $ref: "#/components/schemas/DailyBusinessHour" },
            saturday: { $ref: "#/components/schemas/DailyBusinessHour" },
            sunday: { $ref: "#/components/schemas/DailyBusinessHour" },
        },
        required: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    },
    Address: {
        type: "object",
        description: "Représente une adresse postale complète.",
        properties: {
            addressLine: {
                type: "string",
                nullable: true,
                example: "12 Rue de la Folie Méricourt",
            },
            city: {
                type: "string",
                nullable: true,
                example: "Paris",
            },
            postal_code: {
                type: "string",
                nullable: true,
                example: "75011",
            },
            state: {
                type: "string",
                nullable: true,
                example: "Île-de-France",
            },
            country: {
                type: "string",
                nullable: true,
                example: "France",
            },
        },
    },

    DailyBusinessHour: {
        type: "object",
        description: "Heures d'ouverture et de fermeture pour un jour donné.",
        properties: {
            open: {
                type: "string",
                nullable: true,
                pattern: "^\\d{2}:\\d{2}$",
                example: "08:00",
                description: "Heure d'ouverture au format HH:mm",
            },
            close: {
                type: "string",
                nullable: true,
                pattern: "^\\d{2}:\\d{2}$",
                example: "18:00",
                description: "Heure de fermeture au format HH:mm",
            },
            isClosed: {
                type: "boolean",
                nullable: true,
                example: false,
                description: "Indique si le jour est fermé (fermeture exceptionnelle ou jour de repos)",
            },
        },
        required: ["open", "close"],
    },
    CoworkingOfferType: {
        type: "string",
        description: "Type d'offre pour un espace de coworking",
        enum: ["privateOffice", "coworkingSpace", "meetingRoom"],
        example: "privateOffice"
    },
    CoworkingOffer: {
        type: "object",
        properties: {
            id: {
                type: "integer",
                example: 1,
            },
            type: {
                $ref: "#/components/schemas/CoworkingOfferType",
            },
            description: {
                type: "string",
                example: "Accès libre aux espaces de travail du lundi au vendredi.",
            },
            hourlyRate: {
                type: "number",
                example: 8000,
            },
            dailyRate: {
                type: "number",
                example: 25000,
            },
            features: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "Liste des fonctionnalités de l’offre",
                example: [
                    "Accès 24h/24",
                    "Salle de réunion incluse",
                    "Connexion Wi-Fi haut débit"
                ]
            },
            isTagged: {
                type: "boolean",
                example: true,
            },
            tag: {
                type: "string",
                nullable: true,
                example: "POPULAIRE",
            },
            createdAt: {
                type: "string",
                format: "date-time",
                example: "2025-07-14T10:00:00Z",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2025-07-15T14:30:00Z",
            },
            idCompany: {
                type: "number",
                example: 1,
            },
            officeList: {
                type: "array",
                nullable: true,
                items: {
                    $ref: '#/components/schemas/Office'
                }
            }
        },
        required: [
            "id",
            "name",
            "description",
            "hourlyRate",
            "dailyRate",
            "features",
            "isTagged",
            "createdAt"
        ]
    },
    UnavailablePeriod: {
        type: "object",
        properties: {
            from: {
                type: "string",
                format: "date-time",
                description: "Date et heure de début d'indisponibilité",
                example: "2025-07-24T05:00:00.000Z"
            },
            to: {
                type: "string",
                format: "date-time",
                description: "Date et heure de fin d'indisponibilité",
                example: "2025-07-24T08:00:00.000Z"
            },
            allDay: {
                type: "boolean",
                description: "Indique si l'indisponibilité concerne toute la journée",
                example: true
            }
        },
        required: ["from", "to"]
    },
    OfficeFeature: {
        type: "string",
        properties: {
            value: {
                type: "string",
                example: "wifi",
                description: "Identifiant unique.",
            },
            label: {
                type: "string",
                example: "Wi-Fi Haut Débit",
                description: "Nom ou description de la fonctionnalité.",
            },
        },
        required: ["icon", "label"],
    },
    Office: {
        type: "object",
        properties: {
            id: {
                type: "integer",
                example: 1,
            },
            name: {
                type: "string",
                example: "Bureau privé 1A",
            },
            description: {
                type: "string",
                example: "Un bureau fermé pour 2 personnes, calme et lumineux.",
            },
            features: {
                type: "array",
                description: "Liste des fonctionnalités du bureau",
                items: {
                    $ref: "#/components/schemas/OfficeFeature"
                },
                example: [
                    { icon: "wifi", label: "Internet haut débit" },
                    { icon: "ac_unit", label: "Climatisation" }
                ]
            },
            specificBusinessHour: {
                $ref: "#/components/schemas/BusinessHour",
                nullable: true,
            },
            specificAddress: {
                $ref: "#/components/schemas/Address",
                nullable: true,
            },
            businessHour: {
                $ref: "#/components/schemas/BusinessHour",
                nullable: true,
            },
            maxSeatCapacity: {
                type: "integer",
                example: 4,
            },
            imageUrl: {
                type: "string",
                example: "/uploads/image.png",
            },
            createdAt: {
                type: "string",
                format: "date-time",
                example: "2025-07-14T10:00:00Z",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2025-07-15T14:30:00Z",
            },
            idCoworkingOffer: {
                type: "integer",
                example: 2,
            },
            coworkingCenterAddress: {
                $ref: "#/components/schemas/Address",
                nullable: true,
            },
            coworkingOffer: {
                $ref: "#/components/schemas/CoworkingOffer",
                nullable: true
            },
            unavailablePeriods: {
                type: "array",
                nullable: true,
                items: {
                    $ref: "#/components/schemas/UnavailablePeriod"
                },
                example: [
                    {
                        from: "2025-07-24T05:00:00.000Z",
                        to: "2025-07-24T08:00:00.000Z",
                        allDay: false
                    },
                    {
                        from: "2025-07-25T00:00:00.000Z",
                        to: "2025-07-25T23:59:59.000Z",
                        allDay: true
                    }
                ]
            }
        },
        required: [
            "id",
            "name",
            "description",
            "features",
            "maxSeatCapacity",
            "createdAt",
            "idCoworkingOffer"
        ]
    },
    Invoice: {
        type: "object",
        properties: {
            id: {
                type: "integer",
                example: 1
            },
            reference: {
                type: "string",
                example: "FACT-2025-001"
            },
            user: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        example: "Durand"
                    },
                    firstName: {
                        type: "string",
                        example: "Sophie"
                    },
                    addressLine: {
                        type: "string",
                        example: "23 avenue des Champs-Élysées"
                    },
                    city: {
                        type: "string",
                        example: "Paris"
                    },
                    state: {
                        type: "string",
                        example: "Île-de-France"
                    },
                    postalCode: {
                        type: "string",
                        example: "75008"
                    },
                    country: {
                        type: "string",
                        example: "France"
                    }
                }
            },
            issueDate: {
                type: "string",
                format: "date-time",
                example: "2025-07-22T10:00:00.000Z"
            },
            startSubscription: {
                type: "string",
                format: "date",
                example: "2025-07-22"
            },
            duration: {
                type: "number",
                example: 6
            },
            durationType: {
                type: "string",
                enum: ["hourly", "daily", "monthly", "annualy"],
                example: "monthly"
            },
            note: {
                type: "string",
                example: "Facture pour abonnement bureau virtuel"
            },
            amount: {
                type: "number",
                example: 1200.5
            },
            amountNet: {
                type: "number",
                example: 1150.25,
                nullable: true
            },
            currency: {
                type: "string",
                example: "EUR"
            },
            status: {
                type: "string",
                enum: ["paid", "pending", "sent", "overdue", "canceled"],
                example: "paid"
            },
            paymentMethod: {
                type: "string",
                enum: ["creditCard", "paypal"],
                example: "creditCard"
            },
            stripePaymentId: {
                type: "string",
                example: "pi_3Nd3Gx...",
                nullable: true
            },
            createdAt: {
                type: "string",
                format: "date-time",
                example: "2025-07-22T12:34:56.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null
            },
            idVirtualOfficeOffer: {
                type: "integer",
                nullable: true,
                example: 3
            },
            idAccessCode: {
                type: "integer",
                nullable: true,
                example: 5
            },
            idOffice: {
                type: "integer",
                nullable: true,
                example: 2
            },
            office: {
                $ref: '#/components/schemas/Office'
            }
        }
    },
    AccessCode: {
        type: "object",
        properties: {
            id: {
                type: "integer",
                example: 3
            },
            code: {
                type: "string",
                example: "493027"
            },
            status: {
                type: "string",
                enum: ["pending", "active", "expired"],
                example: "active"
            },
            invoice: {
                $ref: '#/components/schemas/Invoice'
            }

        }
    },
    RGBAColor: {
        type: "object",
        properties: {
            r: { type: "number", example: 145 },
            g: { type: "number", example: 203 },
            b: { type: "number", example: 242 },
            a: { type: "number", example: 1 }
        },
        required: ["r", "g", "b", "a"]
    },

    Shape: {
        oneOf: [
            {
                type: "object",
                properties: {
                    id: { type: "string", example: "3c5b4176" },
                    type: {
                        type: "string",
                        enum: ["rectangle", "circle", "triangle", "arrow"]
                    },
                    x: { type: "number", example: 80 },
                    y: { type: "number", example: 120 },
                    width: { type: "number", example: 100 },
                    height: { type: "number", example: 60 },
                    fillColor: {
                        $ref: "#/components/schemas/RGBAColor"
                    },
                    spaceAssociated: {
                        type: "object",
                        nullable: true,
                        properties: {
                            label: { type: "string", example: "Bureau B01" },
                            isOffice: { type: "boolean", example: true },
                            office: {
                                type: "object",
                                nullable: true,
                                properties: {
                                    id: { type: "integer", example: 2 },
                                    name: { type: "string", example: "Bureau 204" }
                                }
                            }
                        }
                    }
                },
                required: ["id", "type", "x", "y", "width", "height", "fillColor"]
            },
            {
                type: "object",
                properties: {
                    id: { type: "string", example: "51ee1d03" },
                    type: { type: "string", enum: ["polyline"], example: "polyline" },
                    points: {
                        type: "array",
                        items: { type: "number", example: 42 }
                    },
                    strokeColor: {
                        $ref: "#/components/schemas/RGBAColor"
                    }
                },
                required: ["id", "type", "points", "strokeColor"]
            }
        ]
    },

    KonvaMap: {
        type: "object",
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Plan du RDC" },
            map: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Shape"
                },
            },
            createdAt: { type: "string", format: "date-time", example: "2025-09-29T08:00:00Z" },
            updatedAt: { type: "string", format: "date-time", nullable: true, example: null }
        },
        required: ["id", "name", "mapJson", "created_at"]
    },

    VirtualOfficeOffer: {
        type: "object",
        properties: {
            id:
            {
                type: "integer",
                example: 1
            },
            name:
            {
                type: "string",
                example: "Pack Premium"
            },
            description:
            {
                type: "string",
                example: "Accès à un bureau virtuel premium avec services inclus."
            },
            features:
            {
                type: "array",
                items:
                    { type: "string" },
                description: "Liste des fonctionnalités incluses dans l’offre",
                example: ["Support 24/7", "Adresse professionnelle", "Accès aux salles de réunion"]
            },
            price:
            {
                type: "number",
                example: 99.99
            },
            isTagged:
            {
                type: "boolean",
                example: true
            },
            tag:
            {
                type: "string",
                nullable: true,
                example: "BEST SELLER"
            },
            createdAt:
            {
                type: "string",
                format: "date-time",
                example: "2025-08-21T10:00:00Z"
            },
            company:
            {
                type: "object",
                description: "Informations de l'entreprise liée à l’offre",
                properties:
                {
                    id:
                    {
                        type: "integer",
                        example: 12
                    },
                    name:
                    {
                        type: "string",
                        example: "ARBiochem SARL"
                    },
                    slug:
                    {
                        type: "string",
                        example: "arbiochem"
                    },
                    address:
                    {
                        type: "string",
                        example: "123 Rue Principale, Antananarivo"
                    },
                    email:
                    {
                        type: "string",
                        example: "contact@arbiochem.com"
                    },
                    phone:
                    {
                        type: "string",
                        example: "+261 34 12 345 67"
                    }
                }
            }
        },
        required: ["id", "name", "description", "features", "price", "is_tagged", "createdAt", "id_company"]

    }
};

export default schemas;
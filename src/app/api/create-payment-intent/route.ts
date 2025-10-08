import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    //TODO: à récupérer dynamiquement
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripe = require('stripe')(stripeSecretKey)

    try {
        const { amount } = await request.json();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "eur",
            payment_method_types: ["card"],
            automatic_payment_methods: { enabled: false }
        })

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("Internal Error:", error)
        return NextResponse.json(
            { error: `Internal Server Error : ${error}` },
            { status: 500 }
        )
    }
}
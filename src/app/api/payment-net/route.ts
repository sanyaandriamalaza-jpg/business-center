import { NextResponse } from "next/server";

export async function GET(request: Request) {
    //TODO: à récupérer dynamiquement
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripe = require('stripe')(stripeSecretKey)
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId is required" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const latestChargeId = paymentIntent.latest_charge as string;

    if (!latestChargeId) {
      return NextResponse.json(
        { error: "No charge associated with this payment intent" },
        { status: 404 }
      );
    }

    const charge = await stripe.charges.retrieve(latestChargeId);

    const balanceTransactionId = charge.balance_transaction as string;

    if (!balanceTransactionId) {
      return NextResponse.json(
        { error: "No balance transaction found for the charge" },
        { status: 404 }
      );
    }

    const balanceTransaction = await stripe.balanceTransactions.retrieve(
      balanceTransactionId
    );

    return NextResponse.json({
      amount: balanceTransaction.amount / 100, // en EUR
      fee: balanceTransaction.fee / 100,
      net: balanceTransaction.net / 100,
    });
  } catch (error: any) {
    console.error("Error fetching payment net amount:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}